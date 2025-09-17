import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';
import _ from 'lodash';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/catalyst/button';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { TrashIcon, CheckIcon } from '@heroicons/react/16/solid';

import { Receipt } from '@/app/api/receipts/ReceiptApi';
import { RECEIPT_TYPES } from '@/constants/receiptTypes';
import {
  useCreateReceiptMutation,
  useUpdateReceiptMutation,
  useDeleteReceiptMutation
} from '../../hooks/useReceiptAPI';
import { useAuth } from '../../hooks/useAuth';
import { useCreateLinkPayHandler } from '../../hooks/useCreateLinkPayHandler';
import { maxNumberGetDbNumber } from '../../hooks/useMaxNumber';

function ReceiptHeader() {
  const routeParams = useParams<{ receiptNumber: string }>();
  const { receiptNumber } = routeParams;
  const isNewReceipt = receiptNumber === 'new';
  const router = useRouter();

  const [createReceipt] = useCreateReceiptMutation();
  const [saveReceipt] = useUpdateReceiptMutation();
  const [removeReceipt] = useDeleteReceiptMutation();
  const { handleCreateLinkPay } = useCreateLinkPayHandler();

  const methods = useFormContext();
  const { formState, watch, getValues } = methods;
  const { isValid, dirtyFields } = formState;

  const { user } = useAuth();
  const { orderNumber } = watch() as Receipt;

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSaveReceipt() {
    setIsSubmitting(true);
    try {
      await saveReceipt(getValues() as Receipt);
    } catch (error) {
      console.error('儲存收款單失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateReceipt() {
    setIsSubmitting(true);
    try {
      const values = getValues() as Receipt;
      const newReceiptNumber = await maxNumberGetDbNumber(`O${values.orderNumber}`, 2);

      const newReceipt = {
        ...values,
        receiptNumber: newReceiptNumber,
        createdBy: user?.id || '',
        createdAt: new Date(),
        modifiedBy: user?.id || '',
        modifiedAt: new Date()
      } as Receipt;

      const data = await createReceipt(newReceipt).unwrap();

      if (values.receiptType === RECEIPT_TYPES.LINK_PAY) {
        await handleCreateLinkPay(newReceiptNumber, values.receiptAccount, values.email);
      }

      router.push(`/receipts/${data.receiptNumber}`);
    } catch (error) {
      console.error('新增收款單失敗:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRemoveReceipt() {
    removeReceipt(receiptNumber);
    router.push('/receipts');
  }

  return (
    <div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-2 sm:space-y-0 py-6 sm:py-8">
      <div className="flex flex-col items-start space-y-2 sm:space-y-0 w-full sm:max-w-full min-w-0">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
        >
          {/* Breadcrumb placeholder - 可以使用 Venturo 的 breadcrumb 組件 */}
          <nav className="mb-2">
            <button
              onClick={() => router.back()}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              ← 返回
            </button>
          </nav>
        </motion.div>

        <div className="flex items-center max-w-full space-x-3">
          <motion.div
            className="flex flex-col min-w-0"
            initial={{ x: -20 }}
            animate={{ x: 0, transition: { delay: 0.3 } }}
          >
            <Heading className="text-lg sm:text-2xl truncate font-semibold">
              {isNewReceipt ? '新增收款單' : orderNumber}
            </Heading>
            <Text className="text-sm font-medium text-zinc-500">
              收款單詳情
            </Text>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
      >
        {!isNewReceipt && (
          <Button
            color="red"
            onClick={handleRemoveReceipt}
          >
            <TrashIcon />
            <span className="hidden sm:inline ml-2">刪除</span>
          </Button>
        )}
        <Button
          color="blue"
          disabled={_.isEmpty(dirtyFields) || !isValid || isSubmitting}
          onClick={isNewReceipt ? handleCreateReceipt : handleSaveReceipt}
        >
          <CheckIcon />
          <span className="ml-2">{isSubmitting ? '處理中...' : '儲存'}</span>
        </Button>
      </motion.div>
    </div>
  );
}

export default ReceiptHeader;