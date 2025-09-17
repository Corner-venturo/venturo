'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/components/catalyst/dialog';
import { Button } from '@/components/catalyst/button';
import { Input } from '@/components/catalyst/input';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RECEIPT_TYPES } from '@/constants/receiptTypes';
import { createReceiptItemSchema } from '../../schemas/receiptSchema';

export type ReceiptItemFormData = {
	receiptType: number;
	receiptAccount: string;
	receiptAmount: number;
	note?: string;
	email?: string;
	paymentName?: string;
	payDateline?: Date | null;
};

interface ReceiptItemDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (item: ReceiptItemFormData) => void;
	editingItem: ReceiptItemFormData | null;
	receiptType: number;
}

const ReceiptItemDialog: React.FC<ReceiptItemDialogProps> = ({
	open,
	onClose,
	onSave,
	editingItem,
	receiptType: defaultReceiptType
}) => {
	const schema = createReceiptItemSchema(defaultReceiptType);
	const methods = useForm<ReceiptItemFormData>({
		mode: 'onChange',
		resolver: zodResolver(schema),
		defaultValues: {
			receiptType: defaultReceiptType,
			receiptAccount: editingItem?.receiptAccount || '',
			receiptAmount: editingItem?.receiptAmount || 0,
			note: editingItem?.note || '',
			email: editingItem?.email || '',
			paymentName: editingItem?.paymentName || '',
			payDateline: editingItem?.payDateline ? new Date(editingItem.payDateline) : null
		}
	});

	// 當編輯項目變化時，重置表單
	useEffect(() => {
		if (open) {
			methods.reset({
				receiptType: defaultReceiptType,
				receiptAccount: editingItem?.receiptAccount || '',
				receiptAmount: editingItem?.receiptAmount || 0,
				note: editingItem?.note || '',
				email: editingItem?.email || '',
				paymentName: editingItem?.paymentName || '',
				payDateline: editingItem?.payDateline ? new Date(editingItem.payDateline) : null
			});
		}
	}, [open, editingItem, methods.reset, defaultReceiptType]);

	const onSubmit = (data: ReceiptItemFormData) => {
		onSave(data);
		onClose();
	};

	const handleClose = () => {
		methods.reset();
		onClose();
	};

	return (
		<Dialog open={open} onClose={handleClose} size="md">
			<DialogTitle>
				{editingItem ? '編輯收款項目' : '新增收款項目'}
			</DialogTitle>

			<DialogBody>
				<form
					id="receipt-item-form"
					onSubmit={methods.handleSubmit(onSubmit)}
					className="space-y-6"
				>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							{defaultReceiptType === RECEIPT_TYPES.LINK_PAY
								? '收款對象(五字內)'
								: '收款帳號'} <span className="text-red-500">*</span>
						</label>
						<Controller
							name="receiptAccount"
							control={methods.control}
							render={({ field }) => (
								<Input
									{...field}
									placeholder={
										defaultReceiptType === RECEIPT_TYPES.LINK_PAY
											? '請輸入收款對象'
											: '請輸入收款帳號'
									}
									invalid={!!methods.formState.errors.receiptAccount}
								/>
							)}
						/>
						{methods.formState.errors.receiptAccount && (
							<p className="mt-1 text-sm text-red-600">
								{methods.formState.errors.receiptAccount.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							金額 <span className="text-red-500">*</span>
						</label>
						<Controller
							name="receiptAmount"
							control={methods.control}
							render={({ field }) => (
								<Input
									{...field}
									type="number"
									min="1"
									placeholder="請輸入金額"
									invalid={!!methods.formState.errors.receiptAmount}
									onChange={(e) => field.onChange(Number(e.target.value))}
								/>
							)}
						/>
						{methods.formState.errors.receiptAmount && (
							<p className="mt-1 text-sm text-red-600">
								{methods.formState.errors.receiptAmount.message}
							</p>
						)}
					</div>

					{defaultReceiptType === RECEIPT_TYPES.LINK_PAY && (
						<>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									信箱 <span className="text-red-500">*</span>
								</label>
								<Controller
									name="email"
									control={methods.control}
									render={({ field }) => (
										<Input
											{...field}
											type="email"
											placeholder="請輸入電子郵件"
											invalid={!!methods.formState.errors.email}
										/>
									)}
								/>
								{methods.formState.errors.email && (
									<p className="mt-1 text-sm text-red-600">
										{methods.formState.errors.email.message}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									收款名稱(顯示)
								</label>
								<Controller
									name="paymentName"
									control={methods.control}
									render={({ field }) => (
										<Input
											{...field}
											placeholder="請輸入收款名稱"
											invalid={!!methods.formState.errors.paymentName}
										/>
									)}
								/>
								{methods.formState.errors.paymentName && (
									<p className="mt-1 text-sm text-red-600">
										{methods.formState.errors.paymentName.message}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									付款截止日 <span className="text-red-500">*</span>
								</label>
								<Controller
									name="payDateline"
									control={methods.control}
									render={({ field }) => (
										<Input
											{...field}
											type="date"
											value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
											onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
											invalid={!!methods.formState.errors.payDateline}
										/>
									)}
								/>
								{methods.formState.errors.payDateline && (
									<p className="mt-1 text-sm text-red-600">
										{methods.formState.errors.payDateline.message}
									</p>
								)}
							</div>
						</>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							備註
						</label>
						<Controller
							name="note"
							control={methods.control}
							render={({ field }) => (
								<textarea
									{...field}
									rows={3}
									placeholder="請輸入備註"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								/>
							)}
						/>
						{methods.formState.errors.note && (
							<p className="mt-1 text-sm text-red-600">
								{methods.formState.errors.note.message}
							</p>
						)}
					</div>
				</form>
			</DialogBody>

			<DialogActions>
				<Button variant="outline" onClick={handleClose}>
					取消
				</Button>
				<Button
					type="submit"
					form="receipt-item-form"
					color="blue"
				>
					儲存
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ReceiptItemDialog;