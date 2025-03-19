import React, { useMemo, useState, useEffect } from "react";
import {
  Slate,
  Editable,
  withReact,
  useSlate,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import {
  createEditor,
  Editor,
  Element as SlateElement,
  Transforms,
  Node,
} from "slate";

// TypeScript users only add this code
import { BaseEditor, Descendant } from "slate";
import { ReactEditor } from "slate-react";

import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

// Define all possible element types
type ElementType =
  | "paragraph"
  | "heading-one"
  | "heading-two"
  | "block-quote"
  | "numbered-list"
  | "bulleted-list"
  | "list-item";

type CustomElement = {
  type: ElementType;
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
};

type Format = "bold" | "italic" | "underline" | "code";
type BlockFormat =
  | "paragraph"
  | "heading-one"
  | "heading-two"
  | "block-quote"
  | "numbered-list"
  | "bulleted-list";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

// Define proper TypeScript interfaces for props
interface ElementProps extends RenderElementProps {
  element: CustomElement;
}

interface LeafProps extends RenderLeafProps {
  leaf: CustomText;
}

// Define how each element should be rendered
const Element = ({ attributes, children, element }: ElementProps) => {
  switch (element.type) {
    case "heading-one":
      return (
        <h1
          {...attributes}
          style={{ fontSize: "2em", fontWeight: "bold", margin: "0.67em 0" }}
        >
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2
          {...attributes}
          style={{ fontSize: "1.5em", fontWeight: "bold", margin: "0.83em 0" }}
        >
          {children}
        </h2>
      );
    case "block-quote":
      return (
        <blockquote
          {...attributes}
          style={{
            borderLeft: "4px solid #ccc",
            marginLeft: 0,
            paddingLeft: "16px",
            fontStyle: "italic",
          }}
        >
          {children}
        </blockquote>
      );
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

// Define how leaf nodes (text with marks) should be rendered
const Leaf = ({ attributes, children, leaf }: LeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  if (leaf.code) {
    children = (
      <code
        style={{
          backgroundColor: "#f0f0f0",
          padding: "2px 4px",
          borderRadius: "4px",
          fontFamily: "monospace",
        }}
      >
        {children}
      </code>
    );
  }
  return <span {...attributes}>{children}</span>;
};

// Create a plugin to handle lists
const withLists = (editor: BaseEditor & ReactEditor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = ([node, path]) => {
    if (SlateElement.isElement(node)) {
      // If the element is a list and its children aren't list items, convert them
      if (node.type === "numbered-list" || node.type === "bulleted-list") {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (SlateElement.isElement(child) && child.type !== "list-item") {
            Transforms.setNodes(
              editor,
              { type: "list-item" },
              { at: [...path, i] },
            );
          }
        }
      }

      // Ensure list items are only direct children of lists
      if (node.type === "list-item") {
        const [parent] = Editor.parent(editor, path);
        if (
          SlateElement.isElement(parent) &&
          parent.type !== "numbered-list" &&
          parent.type !== "bulleted-list"
        ) {
          Transforms.wrapNodes(
            editor,
            { type: "bulleted-list", children: [] },
            { at: path },
          );
        }
      }
    }

    // Fall back to the original normalization.
    normalizeNode([node, path]);
  };

  return editor;
};

interface TextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
}

const TextEditor = ({ value, onChange }: TextEditorProps) => {
  // Apply the lists plugin
  const editor = useMemo(() => withLists(withReact(createEditor())), []);

  const [editorValue, setEditorValue] = useState<Descendant[]>(initialValue);

  useEffect(() => {
    setEditorValue(value.length ? value : initialValue);
  }, [value]);

  return (
    <div
      style={{
        border: "1px solid #667A8A",
        padding: "10px",
        borderRadius: "5px",
        width: "100%",
      }}
    >
      <Slate
        editor={editor}
        initialValue={editorValue}
        onChange={(newValue) => {
          setEditorValue(newValue);
          onChange(newValue);
        }}
      >
        <FormatButtons />
        <Editable
          placeholder="Enter some text…"
          style={{
            minHeight: "150px",
            padding: "10px",
            borderRadius: "5px",
          }}
          renderElement={(props) => <Element {...props} />}
          renderLeaf={(props) => <Leaf {...props} />}
        />
      </Slate>
    </div>
  );
};

// Extract the formatting buttons to a separate component to use useSlate correctly
const FormatButtons = () => {
  const editor = useSlate();

  // Check if mark is active
  const isMarkActive = (format: Format): boolean => {
    const marks = Editor.marks(editor);
    return marks ? (marks as Record<string, boolean>)[format] === true : false;
  };

  // Toggle mark
  const toggleMark = (format: Format): void => {
    const isActive = isMarkActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  // Check if block is active
  const isBlockActive = (format: BlockFormat): boolean => {
    const [match] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    });

    return !!match;
  };

  // BUG: The toggleBlock function is not working as expected the list is not being toggled
  // Toggle block
  const toggleBlock = (format: BlockFormat): void => {
    const isActive = isBlockActive(format);

    // Handle lists differently
    if (format === "numbered-list" || format === "bulleted-list") {
      // First, determine if we're in a list already
      const isList =
        isBlockActive("numbered-list") || isBlockActive("bulleted-list");
      const isCurrentTypeActive = isBlockActive(format);

      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n.type === "numbered-list" || n.type === "bulleted-list"),
        split: true,
      });

      // If we're clicking on the active list type, convert to paragraphs
      if (isCurrentTypeActive) {
        Transforms.setNodes(editor, {
          type: "paragraph",
        });
      } else {
        // Otherwise, convert to list items and wrap in the appropriate list type
        Transforms.setNodes(editor, {
          type: "list-item",
        });

        Transforms.wrapNodes(editor, {
          type: format,
          children: [],
        });
      }
    } else {
      // Handle regular blocks
      // First unwrap from any lists if we're in a list
      const isList =
        isBlockActive("numbered-list") || isBlockActive("bulleted-list");
      if (isList) {
        Transforms.unwrapNodes(editor, {
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            (n.type === "numbered-list" || n.type === "bulleted-list"),
          split: true,
        });
      }

      Transforms.setNodes(
        editor,
        { type: isActive ? "paragraph" : format },
        { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) },
      );
    }
  };

  const renderMarkButton = (format: Format, label: string) => {
    const isActive = isMarkActive(format);

    return (
      <ToggleGroupItem
        key={format}
        value={format}
        aria-label={format}
        data-state={isActive ? "on" : "off"}
        className={isActive ? "bg-slate-200" : ""}
        onMouseDown={(event: React.MouseEvent) => {
          event.preventDefault();
          toggleMark(format);
        }}
      >
        {label}
      </ToggleGroupItem>
    );
  };

  const renderBlockButton = (format: BlockFormat, label: string) => {
    const isActive = isBlockActive(format);

    return (
      <ToggleGroupItem
        key={format}
        value={format}
        aria-label={format}
        data-state={isActive ? "on" : "off"}
        className={isActive ? "bg-slate-200" : ""}
        onMouseDown={(event: React.MouseEvent) => {
          event.preventDefault();
          toggleBlock(format);
        }}
      >
        {label}
      </ToggleGroupItem>
    );
  };

  return (
    <ToggleGroup
      type="multiple"
      style={{ marginBottom: "10px" }}
      className="flex items-start border-b border-[#667A8A] pb-2"
    >
      {renderMarkButton("bold", "B")}
      {renderMarkButton("italic", "I")}
      {renderMarkButton("underline", "U")}
      {renderMarkButton("code", "<>")}
      {renderBlockButton("heading-one", "H1")}
      {renderBlockButton("heading-two", "H2")}
      {renderBlockButton("block-quote", "❝")}
      {renderBlockButton("numbered-list", "1.")}
      {renderBlockButton("bulleted-list", "•")}
    </ToggleGroup>
  );
};

export default TextEditor;
