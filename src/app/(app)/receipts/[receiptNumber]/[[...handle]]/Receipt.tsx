'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';

import { Heading } from '@/components/catalyst/heading';
import { Button } from '@/components/catalyst/button';
import { Text } from '@/components/catalyst/text';
import ReceiptHeader from './ReceiptHeader';
import ReceiptModel from '../../models/ReceiptModel';
import BasicInfoTab from './tabs/BasicInfoTab';
import { RECEIPT_STATUS } from '@/constants/receiptStatus';
import { createReceiptSchema } from '../../schemas/receiptSchema';
import { useGetReceiptQuery } from '../../hooks/useReceiptAPI';

// 使用共用 schema
const schema = createReceiptSchema();

// 模擬加載組件
const FuseLoading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

function Receipt() {
  const routeParams = useParams<{ receiptNumber: string }>();
  const { receiptNumber } = routeParams;

  const {
    data: receipt,
    isLoading,
    isError
  } = useGetReceiptQuery(receiptNumber, {
    skip: !receiptNumber || receiptNumber === 'new'
  });

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      receiptType: null,
      status: RECEIPT_STATUS.PENDING,
      receiptAmount: 0,
      actualAmount: 0,
      receiptNumber: '',
      orderNumber: '',
      receiptAccount: '',
      email: '',
      note: '',
      paymentName: '',
      linkpay: []
    },
    resolver: zodResolver(schema)
  });

  const { reset, watch } = methods;
  const form = watch();

  useEffect(() => {
    if (receiptNumber === 'new') {
      reset({ ...ReceiptModel({}), paymentName: '' });
    }
  }, [receiptNumber, reset]);

  useEffect(() => {
    if (receipt) {
      reset({ ...ReceiptModel(receipt), linkpay: receipt.linkpay, paymentName: '' });
    }
  }, [receipt, reset]);

  if (isLoading) {
    return <FuseLoading />;
  }

  if (isError && receiptNumber !== 'new') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col flex-1 items-center justify-center h-full"
      >
        <Text className="text-zinc-500 text-xl mb-6">
          找不到此收款單！
        </Text>
        <Button
          color="zinc"
          outline
          href="/receipts"
        >
          返回收款單列表
        </Button>
      </motion.div>
    );
  }

  if (_.isEmpty(form)) {
    return <FuseLoading />;
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-7xl mx-auto">
        <ReceiptHeader />
        <div className="p-4 sm:p-6 max-w-5xl space-y-6">
          <div className="">
            <BasicInfoTab />
          </div>
        </div>
      </div>
    </FormProvider>
  );
}

export default Receipt;