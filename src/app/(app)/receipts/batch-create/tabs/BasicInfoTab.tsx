'use client';

import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Button } from '@/components/catalyst/button';
import { Input } from '@/components/catalyst/input';
import { Select } from '@/components/catalyst/select';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/catalyst/table';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { orderAPI } from '@/lib/api/order';
import { RECEIPT_TYPE_OPTIONS } from '@/constants/receiptTypes';
import { useMemo, useState, useEffect } from 'react';
import ReceiptItemDialog, { ReceiptItemFormData } from '../components/ReceiptItemDialog';

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState, setValue, watch } = methods;
	const { errors } = formState;

	const [orders, setOrders] = useState<any[]>([]);
	const [loadingOrders, setLoadingOrders] = useState(false);

	// 使用 useFieldArray 管理多組收據項目
	const { fields, append, remove, update } = useFieldArray({
		control,
		name: 'receiptItems'
	});

	// 在使用 fields 時進行類型斷言
	const typedFields = fields as unknown as (ReceiptItemFormData & { id: string })[];

	const receiptItems = watch('receiptItems') || [];

	// 監控 receiptType 以條件性顯示欄位
	const receiptType = useWatch({
		control,
		name: 'receiptType'
	});

	// 對話框狀態
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

	// 載入訂單資料
	useEffect(() => {
		async function loadOrders() {
			setLoadingOrders(true);
			try {
				const result = await orderAPI.getAll();
				if (result.success && result.data) {
					setOrders(result.data);
				}
			} catch (error) {
				console.error('載入訂單失敗:', error);
			} finally {
				setLoadingOrders(false);
			}
		}

		loadOrders();
	}, []);

	// 計算總金額
	const totalAmount = useMemo(() => {
		if (!receiptItems || receiptItems.length === 0) return 0;

		return receiptItems.reduce((sum, item) => {
			return sum + (Number(item.receiptAmount) || 0);
		}, 0);
	}, [receiptItems]);

	// 開啟新增對話框
	const handleAddReceiptItem = () => {
		setEditingItemIndex(null);
		setDialogOpen(true);
	};

	// 開啟編輯對話框
	const handleEditReceiptItem = (index: number) => {
		setEditingItemIndex(index);
		setDialogOpen(true);
	};

	// 儲存收據項目
	const handleSaveReceiptItem = (item: any) => {
		if (editingItemIndex !== null) {
			// 更新現有項目
			update(editingItemIndex, item);
		} else {
			// 新增項目
			append(item);
		}
	};

	// 訂單選項格式化
	const orderOptions = orders.map((order) => ({
		value: order.order_number,
		label: `${order.order_number} - ${order.customer_name} - ${order.contact_person || order.customer_name}`
	}));

	return (
		<div className="space-y-8">
			{/* 共同設定區域 */}
			<div className="bg-white shadow rounded-lg">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-medium text-gray-900">共同設定</h3>
				</div>
				<div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							訂單編號 <span className="text-red-500">*</span>
						</label>
						<Controller
							name="orderNumber"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									invalid={!!errors.orderNumber}
									disabled={loadingOrders}
								>
									<option value="">
										{loadingOrders ? '載入中...' : '請選擇訂單'}
									</option>
									{orderOptions.map((option) => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</Select>
							)}
						/>
						{errors.orderNumber && (
							<p className="mt-1 text-sm text-red-600">
								{errors.orderNumber.message as string}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							收款日期 <span className="text-red-500">*</span>
						</label>
						<Controller
							name="receiptDate"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type="date"
									value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
									onChange={(e) => field.onChange(e.target.value)}
									invalid={!!errors.receiptDate}
								/>
							)}
						/>
						{errors.receiptDate && (
							<p className="mt-1 text-sm text-red-600">
								{errors.receiptDate.message as string}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							收款方式 <span className="text-red-500">*</span>
						</label>
						<Controller
							name="receiptType"
							control={control}
							render={({ field }) => (
								<Select
									{...field}
									value={field.value || ''}
									invalid={!!errors.receiptType}
								>
									<option value="">請選擇收款方式</option>
									{RECEIPT_TYPE_OPTIONS.map((option) => (
										<option key={option.value} value={option.value.toString()}>
											{option.label}
										</option>
									))}
								</Select>
							)}
						/>
						{errors.receiptType && (
							<p className="mt-1 text-sm text-red-600">
								{errors.receiptType.message as string}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* 收據項目區域 */}
			<div>
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-medium text-gray-900">收據項目</h3>
					<Button
						color="blue"
						onClick={handleAddReceiptItem}
					>
						<PlusIcon />
						新增項目
					</Button>
				</div>

				<div className="bg-white shadow rounded-lg overflow-hidden">
					<Table>
						<TableHead>
							<TableRow>
								<TableHeader>收款帳號</TableHeader>
								<TableHeader className="text-right">金額</TableHeader>
								<TableHeader>備註</TableHeader>
								<TableHeader className="text-right">操作</TableHeader>
							</TableRow>
						</TableHead>
						<TableBody>
							{typedFields.map((field, index) => (
								<TableRow key={field.id}>
									<TableCell>{field.receiptAccount}</TableCell>
									<TableCell className="text-right">
										{field.receiptAmount?.toLocaleString()}
									</TableCell>
									<TableCell>{field.note}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												onClick={() => handleEditReceiptItem(index)}
											>
												<PencilIcon />
											</Button>
											<Button
												color="red"
												variant="outline"
												onClick={() => remove(index)}
												disabled={fields.length <= 1}
											>
												<TrashIcon />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* 總金額顯示 */}
			<div className="flex justify-end">
				<div className="text-lg font-semibold text-gray-900">
					總金額: {totalAmount.toLocaleString()}
				</div>
			</div>

			{/* 收據項目對話框 */}
			<ReceiptItemDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSave={handleSaveReceiptItem}
				editingItem={editingItemIndex !== null ? typedFields[editingItemIndex] : null}
				receiptType={Number(receiptType)}
			/>
		</div>
	);
}

export default BasicInfoTab;