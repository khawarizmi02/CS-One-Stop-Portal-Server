import React from 'react'
import { checkRole } from '@/utils/roles'
import { redirect } from 'next/navigation'

export default async function CreateUser () {

	const isAdmin = await checkRole('admin')
	if (!isAdmin) redirect('/')

	return (
		<div>CreateUser</div>
	)
}