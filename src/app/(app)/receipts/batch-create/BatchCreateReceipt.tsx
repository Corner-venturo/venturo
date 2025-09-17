'use client';

import { useEffect } from 'react';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BatchCreateReceiptHeader from './BatchCreateReceiptHeader';
import BatchCreateReceiptModel from '../models/BatchCreateReceiptModel';
import BasicInfoTab from './tabs/BasicInfoTab';
import { createBatchReceiptSchema } from '../schemas/receiptSchema';

/**
 * 表單驗證模式
 */
const schema = createBatchReceiptSchema();

function BatchCreateReceipt() {
	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;
	const form = watch();

	useEffect(() => {
		reset(BatchCreateReceiptModel({}));
	}, [reset]);

	if (_.isEmpty(form)) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-gray-500">載入中...</div>
			</div>
		);
	}

	return (
		<FormProvider {...methods}>
			<div className="h-full">
				<BatchCreateReceiptHeader />
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
					<div className="space-y-6">
						<BasicInfoTab />
					</div>
				</div>
			</div>
		</FormProvider>
	);
}

export default BatchCreateReceipt;