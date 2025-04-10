"use client";

import React, { useState } from "react";
import EmailNav from "./EmailNav";
import { Inbox, File, Send, Archive, Trash2, AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

type Props = {
  isCollapsed: boolean;
};

const EmailSidebar = ({ isCollapsed }: Props) => {
  const [tab, setTab] = useLocalStorage("activeTab", "inbox");
  const [accountId] = useLocalStorage("accountId", "");
  const [activeTab, setActiveTab] = useState(tab);
  const refetchInterval = 1000 * 60 * 1;
  // Mock data for demonstration
  // const inboxCount = "5";
  // const draftsCount = "2";
  // const sentCount = "12";

  const { data: inboxCount } = api.mail.getNumThreads.useQuery(
    {
      accountId,
      tab: "inbox",
    },
    // { enabled: !!accountId && !!tab, refetchInterval },
    { enabled: !!accountId && !!tab },
  );

  const { data: draftsCount } = api.mail.getNumThreads.useQuery(
    {
      accountId,
      tab: "drafts",
    },
    // { enabled: !!accountId && !!tab, refetchInterval },
    { enabled: !!accountId && !!tab },
  );

  const { data: sentCount } = api.mail.getNumThreads.useQuery(
    {
      accountId,
      tab: "sent",
    },
    // { enabled: !!accountId && !!tab, refetchInterval },
    { enabled: !!accountId && !!tab },
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setTab(tab);
    // You can add additional logic here, like storing in localStorage
    // or calling an API endpoint
  };

  return (
    <div className="h-full border-r">
      <EmailNav
        isCollapsed={isCollapsed}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        links={[
          {
            title: "Inbox",
            label: String(inboxCount ?? 0),
            icon: Inbox,
            variant: activeTab === "inbox" ? "default" : "ghost",
          },
          {
            title: "Drafts",
            label: String(draftsCount ?? 0),
            icon: File,
            variant: activeTab === "drafts" ? "default" : "ghost",
          },
          {
            title: "Sent",
            label: String(sentCount ?? 0),
            icon: Send,
            variant: activeTab === "sent" ? "default" : "ghost",
          },
          // {
          //   title: "Archive",
          //   icon: Archive,
          //   variant: activeTab === "archive" ? "default" : "ghost",
          // },
          // {
          //   title: "Trash",
          //   icon: Trash2,
          //   variant: activeTab === "trash" ? "default" : "ghost",
          // },
          // {
          //   title: "Spam",
          //   icon: AlertCircle,
          //   variant: activeTab === "spam" ? "default" : "ghost",
          // },
        ]}
      />
    </div>
  );
};

export default EmailSidebar;
