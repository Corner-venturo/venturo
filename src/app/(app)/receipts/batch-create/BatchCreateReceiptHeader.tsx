'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/catalyst/button';
import { Heading } from '@/components/catalyst/heading';
import { useAuth } from '@/hooks/useAuth';
import { receiptAPI } from '@/lib/api/receipt';
import { useCreateLinkPayHandler } from '../hooks/useCreateLinkPayHandler';
import { RECEIPT_TYPES } from '@/constants/receiptTypes';
import { CheckIcon } from '@heroicons/react/24/outline';

function BatchCreateReceiptHeader() {
	const methods = useFormContext();
	const { formState, getValues } = methods;
	const { isValid } = formState;

	const router = useRouter();
	const { user } = useAuth();
	const { handleCreateLinkPay } = useCreateLinkPayHandler();
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleCreateReceipts() {
		setIsSubmitting(true);
		try {
			if (!isValid) return;

			const values = getValues();
			const { orderNumber, receiptDate, receiptType, receiptItems } = values;

			// 批量創建收款
			const receiptsToCreate = [];
			for (const item of receiptItems) {
				// 為每個收款生成唯一編號 (使用簡化的時間戳)
				const newReceiptNumber = `R${Date.now()}-${Math.floor(Math.random() * 1000)}`;

				const newReceipt = {
					receiptNumber: newReceiptNumber,
					orderNumber,
					receiptDate: new Date(receiptDate),
					receiptType: Number(receiptType),
					receiptAccount: item.receiptAccount,
					receiptAmount: item.receiptAmount,
					actualAmount: item.receiptAmount,
					note: item.note || '',
					email: item.email || '',
					payDateline: item.payDateline ? new Date(item.payDateline) : new Date(),
					status: 1, // 待收款
					createdBy: user?.id || '',
					createdAt: new Date(),
					modifiedBy: user?.id || '',
					modifiedAt: new Date()
				};

				receiptsToCreate.push(newReceipt);
			}

			// 使用批量創建 API
			const result = await receiptAPI.batchCreate({ receipts: receiptsToCreate });

			if (result.success && result.data) {
				// 如果是 LinkPay 類型，自動創建 LinkPay
				if (~~receiptType === RECEIPT_TYPES.LINK_PAY) {
					for (let i = 0; i < result.data.length; i++) {
						const receipt = result.data[i];
						const item = receiptItems[i];

						if (item.email) {
							await handleCreateLinkPay(
								receipt.receiptNumber,
								item.receiptAccount,
								item.email,
								() => {},
								item.paymentName
							);
						}
					}
				}

				// 創建完成後導航回收款列表
				alert('批量創建收款單成功！');
				router.push(`/receipts`);
			} else {
				throw new Error(result.message || '批量創建失敗');
			}
		} catch (error) {
			console.error('批量創建收款失敗:', error);
			alert(error instanceof Error ? error.message : '批量創建收款失敗，請稍後重試');
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				{/* 標題區域 */}
				<div className="space-y-2">
					<div className="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400">
						<span>收款管理</span>
						<span>/</span>
						<span>批量新增收款</span>
					</div>
					<Heading level={1}>批量新增收款</Heading>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						批量新增收款詳情
					</p>
				</div>

				{/* 操作按鈕區域 */}
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						onClick={() => router.push('/receipts')}
						disabled={isSubmitting}
					>
						取消
					</Button>

					<Button
						color="blue"
						disabled={!isValid || isSubmitting}
						onClick={handleCreateReceipts}
					>
						<CheckIcon />
						{isSubmitting ? '處理中...' : '批量新增'}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default BatchCreateReceiptHeader;