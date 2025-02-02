import React from 'react'
import { checkRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import axios from "axios"

export default async function User () {
	const isAdmin = await checkRole('admin')
	if (!isAdmin) redirect('/')

	return (
		<div>User List</div>
	)
}