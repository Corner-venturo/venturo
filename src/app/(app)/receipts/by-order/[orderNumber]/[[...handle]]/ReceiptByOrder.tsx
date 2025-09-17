'use client';

import { useState, useEffect, Fragment } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/catalyst/button';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/components/catalyst/dialog';
import { XMarkIcon } from '@heroicons/react/16/solid';

import ReceiptByOrderHeader from './ReceiptByOrderHeader';
import ReceiptByOrderTable from './ReceiptByOrderTable';
import ReceiptByOrderForm from './ReceiptByOrderForm';
import { RECEIPT_TYPES } from '@/constants/receiptTypes';
import { RECEIPT_STATUS } from '@/constants/receiptStatus';
import { createReceiptSchema } from '../../../schemas/receiptSchema';
import {
  useGetReceiptsByOrderNumberQuery,
  useGetReceiptQuery,
  useUpdateReceiptMutation
} from '../../../hooks/useReceiptAPI';
import { useGetOrderQuery } from '../../../hooks/useOrderAPI';
import { useCreateLinkPayHandler } from '../../../hooks/useCreateLinkPayHandler';

// 定義表單數據類型
export type ReceiptFormData = {
  receiptNumber: string;
  orderNumber: string;
  receiptDate: string | Date;
  receiptAmount: number;
  actualAmount: number;
  receiptType: number;
  receiptAccount?: string;
  payDateline?: string | Date;
  email?: string;
  note?: string;
  status: number;
};

// 使用共用 schema，並指定包含收款編號、狀態必填和實際金額
const schema = createReceiptSchema({
  includeReceiptNumber: true,
  statusRequired: true,
  includeActualAmount: true
});


// 模擬加載組件
const FuseLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

/**
 * 根據訂單號碼獲取並顯示收款清單，可彈窗編輯
 */
export default function ReceiptByOrder() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [updateReceipt] = useUpdateReceiptMutation();

  // 使用共用的 LinkPay 創建 hook
  const { handleCreateLinkPay, isCreating } = useCreateLinkPayHandler();

  const { data: receipts, isLoading, isError } = useGetReceiptsByOrderNumberQuery(orderNumber);

  const { data: receiptDetail, isLoading: isLoadingDetail } = useGetReceiptQuery(selectedReceipt || '', {
    skip: !selectedReceipt
  });

  const { data: orderDetail, isLoading: isLoadingOrder } = useGetOrderQuery(orderNumber, {
    skip: !orderNumber
  });

  const methods = useForm<ReceiptFormData>({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: {
      receiptType: RECEIPT_TYPES.BANK_TRANSFER,
      status: RECEIPT_STATUS.PENDING
    }
  });

  const {
    reset,
    handleSubmit,
    formState: { isValid, dirtyFields }
  } = methods;

  const handleEditClick = (receiptNumber: string) => {
    setSelectedReceipt(receiptNumber);
    setIsEditDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedReceipt(null);
    reset({
      receiptType: RECEIPT_TYPES.BANK_TRANSFER,
      status: RECEIPT_STATUS.PENDING
    });
  };

  const onSubmit = async (data: ReceiptFormData) => {
    try {
      // 如果是 LinkPay 類型，檢查必填欄位
      if (data.receiptType === RECEIPT_TYPES.LINK_PAY) {
        if (!data.email) {
          console.log('LinkPay 付款方式必須填寫 Email');
          return;
        }

        if (!data.receiptAccount) {
          console.log('LinkPay 付款方式必須填寫收款帳號');
          return;
        }

        if (!data.payDateline) {
          console.log('LinkPay 付款方式必須填寫付款截止日');
          return;
        }

        // 如果是新建的 LinkPay 收據，自動創建 LinkPay
        if (data.status === RECEIPT_STATUS.PENDING) {
          await handleCreateLinkPay(data.receiptNumber, data.receiptAccount, data.email);
        }
      }

      // 如果是銀行轉帳，檢查收款帳號
      if (data.receiptType === RECEIPT_TYPES.BANK_TRANSFER && !data.receiptAccount) {
        console.log('銀行轉帳付款方式必須填寫收款帳號');
        return;
      }

      const updatedData = {
        ...data,
        receiptType: data.receiptType ?? RECEIPT_TYPES.BANK_TRANSFER,
        status: data.status ?? RECEIPT_STATUS.PENDING
      };

      await updateReceipt(updatedData).unwrap();
      handleCloseDialog();
    } catch (error) {
      console.error('更新收款時發生錯誤:', error);
    }
  };

  useEffect(() => {
    if (receiptDetail) {
      const formData = {
        ...receiptDetail,
        receiptType: receiptDetail.receiptType ?? RECEIPT_TYPES.BANK_TRANSFER,
        status: receiptDetail.status ?? RECEIPT_STATUS.PENDING
      } as ReceiptFormData;

      reset(formData);
    }
  }, [receiptDetail, reset]);

  if (isLoading) {
    return <FuseLoading />;
  }

  if (isError || (receipts && receipts.length === 0)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Text className="text-zinc-500 text-xl mb-6">
          找不到與訂單號碼 {orderNumber} 相關的收款！
        </Text>
        <Button
          color="zinc"
          outline
          href="/receipts"
        >
          返回收款列表
        </Button>
      </motion.div>
    );
  }

  return (
    <Fragment>
      <div className="max-w-7xl mx-auto">
        <ReceiptByOrderHeader orderNumber={orderNumber} />
        <div className="p-4 sm:p-6 max-w-7xl space-y-6">
          {orderDetail && (
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg">
              <Heading level={3} className="mb-3">
                訂單資訊
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    團號:
                  </Text>
                  <Text className="font-medium">
                    {orderDetail.groupCode || '無'}
                  </Text>
                </div>
                <div>
                  <Text className="text-sm text-zinc-600 dark:text-zinc-400">
                    團名:
                  </Text>
                  <Text className="font-medium">
                    {orderDetail.groupName || '無'}
                  </Text>
                </div>
              </div>
            </div>
          )}

          <ReceiptByOrderTable
            receipts={receipts}
            onEditClick={handleEditClick}
          />
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onClose={handleCloseDialog} size="2xl">
        <DialogTitle className="flex items-center justify-between">
          <span>編輯收款</span>
          <Button plain onClick={handleCloseDialog}>
            <XMarkIcon />
          </Button>
        </DialogTitle>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ReceiptByOrderForm
              isLoading={isLoadingDetail}
              onClose={handleCloseDialog}
              isValid={isValid}
              isDirty={Object.keys(dirtyFields).length > 0}
              isCreating={isCreating}
            />
          </form>
        </FormProvider>
      </Dialog>
    </Fragment>
  );
}