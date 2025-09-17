import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table';
import { Button } from '@/components/catalyst/button';
import { Badge } from '@/components/catalyst/badge';
import { PencilIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';

import { Receipt } from '@/app/api/receipts/ReceiptApi';
import { getReceiptTypeName } from '@/constants/receiptTypes';
import { getReceiptStatusName, getReceiptStatusColor } from '@/constants/receiptStatus';
import { RECEIPT_TYPES } from '@/constants/receiptTypes';
import LinkPayExpandableRow from '../../../LinkPayExpandableRow';

type ReceiptByOrderTableProps = {
  receipts: Receipt[];
  onEditClick: (receiptNumber: string) => void;
};

function ReceiptByOrderTable({ receipts, onEditClick }: ReceiptByOrderTableProps) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const handleToggleRow = (receiptNumber: string) => {
    setOpenRows((prev) => ({
      ...prev,
      [receiptNumber]: !prev[receiptNumber]
    }));
  };

  // 處理 LinkPay 創建成功後的回調
  const handleLinkPayCreated = () => {
    // 強制重新獲取數據
    setRefreshKey((prev) => prev + 1);
    // 這裡可以添加其他邏輯，例如重新獲取收據數據
  };

  return (
    <div className="border border-zinc-950/10 dark:border-white/10 rounded-lg overflow-hidden">
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>收款單號</TableHeader>
            <TableHeader>收款日期</TableHeader>
            <TableHeader>收款方式</TableHeader>
            <TableHeader>收款金額</TableHeader>
            <TableHeader>實際金額</TableHeader>
            <TableHeader>狀態</TableHeader>
            <TableHeader>操作</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {receipts?.map((receipt) => (
            <React.Fragment key={receipt.receiptNumber}>
              <TableRow className="hover:bg-zinc-50 dark:hover:bg-white/2.5">
                <TableCell>
                  <Link
                    href={`/receipts/${receipt.receiptNumber}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {receipt.receiptNumber}
                  </Link>
                </TableCell>
                <TableCell>{format(new Date(receipt.receiptDate), 'yyyy-MM-dd')}</TableCell>
                <TableCell>{getReceiptTypeName(receipt.receiptType)}</TableCell>
                <TableCell>{receipt.receiptAmount?.toLocaleString()}</TableCell>
                <TableCell>{receipt.actualAmount?.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge color={getReceiptStatusColor(receipt.status)}>
                    {getReceiptStatusName(receipt.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      color="blue"
                      onClick={() => onEditClick(receipt.receiptNumber)}
                      size="sm"
                    >
                      <PencilIcon />
                    </Button>

                    {receipt.receiptType === RECEIPT_TYPES.LINK_PAY &&
                      receipt.linkpay &&
                      receipt.linkpay.length > 0 && (
                        <Button
                          color="zinc"
                          onClick={() => handleToggleRow(receipt.receiptNumber)}
                          size="sm"
                          title="查看 LinkPay 資訊"
                        >
                          {openRows[receipt.receiptNumber] ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          )}
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
              {receipt.receiptType === RECEIPT_TYPES.LINK_PAY && (
                <LinkPayExpandableRow
                  receipt={receipt}
                  linkpayData={receipt.linkpay || []}
                  open={!!openRows[receipt.receiptNumber]}
                  onToggle={() => handleToggleRow(receipt.receiptNumber)}
                  onLinkPayCreated={handleLinkPayCreated}
                />
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ReceiptByOrderTable;