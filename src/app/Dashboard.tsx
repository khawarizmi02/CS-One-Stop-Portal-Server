import React from 'react'
import { UserButton } from '@clerk/nextjs'

const Dashboard = () => {
	return (
		<div>
			<h1>Dashboard</h1>
			<div>
				<UserButton />
			</div>
		</div>
	)
}

export default Dashboard