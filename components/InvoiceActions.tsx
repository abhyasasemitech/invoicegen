import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { CheckCircle, DownloadCloudIcon, Mail, MoreHorizontal, Pencil, Trash } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

interface Props {
    id: string
}

const InvoiceActions = ({id}:Props) => {
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button size="icon" variant="secondary">

            <MoreHorizontal className=' size-4'/>
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end'>
            <DropdownMenuItem asChild>
                <Link href={`/dashboard/invoices/${id}`}>
                <Pencil className=' size-4 mr-2'/> Edit Invoice
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Link href={`/api/invoice/${id}`} target='_blank'>
                <DownloadCloudIcon className=' size-4 mr-2'/> Download Invoice
                </Link>
            </DropdownMenuItem>

            {/* <DropdownMenuItem asChild>
                <Link href="">
                <Mail className=' size-4 mr-2'/> Remainder Email
                </Link>
            </DropdownMenuItem> */}

            <DropdownMenuItem asChild>
                <Link href="">
                <Trash className=' size-4 mr-2'/> Delete Invoice
                </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
            <Link href={`/dashboard/invoices/${id}/paid`}>
                <CheckCircle className=' size-4 mr-2'/> Mark as Paid
                </Link>
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default InvoiceActions
