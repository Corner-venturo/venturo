import { Controller, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';

import { Input } from '@/components/catalyst/input';
import { Select } from '@/components/catalyst/select';
import { Textarea } from '@/components/catalyst/textarea';
import { Field, Label } from '@/components/catalyst/fieldset';
import { Text } from '@/components/catalyst/text';
import { Button } from '@/components/catalyst/button';
import { DialogActions, DialogBody } from '@/components/catalyst/dialog';
import { CheckIcon } from '@heroicons/react/16/solid';

import { RECEIPT_TYPE_OPTIONS, RECEIPT_TYPES } from '@/constants/receiptTypes';
import { RECEIPT_STATUS_OPTIONS, RECEIPT_STATUS } from '@/constants/receiptStatus';
import { ReceiptFormData } from './ReceiptByOrder';

// 模擬加載組件
const FuseLoading = () => (
  <div className="flex items-center justify-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

type ReceiptByOrderFormProps = {
  isLoading: boolean;
  onClose: () => void;
  isValid: boolean;
  isDirty: boolean;
  isCreating: boolean;
};

function ReceiptByOrderForm({ isLoading, onClose, isValid, isDirty, isCreating }: ReceiptByOrderFormProps) {
  const {
    control,
    formState: { errors },
    watch,
    trigger
  } = useFormContext<ReceiptFormData>();

  // 監控 receiptType 的值，確保它始終有值
  const receiptType = watch('receiptType') ?? RECEIPT_TYPES.BANK_TRANSFER;

  // 當 receiptType 變更時，觸發表單驗證
  useEffect(() => {
    trigger();
  }, [receiptType, trigger]);

  return (
    <>
      <DialogBody>
        {isLoading ? (
          <FuseLoading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <Label>收據編號</Label>
              <Controller
                name="receiptNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled
                    value={field.value ?? ''}
                  />
                )}
              />
              {errors.receiptNumber && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.receiptNumber.message}
                </Text>
              )}
            </Field>

            <Field>
              <Label>訂單編號</Label>
              <Controller
                name="orderNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled
                    value={field.value ?? ''}
                  />
                )}
              />
              {errors.orderNumber && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.orderNumber.message}
                </Text>
              )}
            </Field>

            <Field>
              <Label>收據日期 *</Label>
              <Controller
                name="receiptDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                    invalid={!!errors.receiptDate}
                  />
                )}
              />
              {errors.receiptDate && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.receiptDate.message}
                </Text>
              )}
            </Field>

            <Field>
              <Label>收款方式 *</Label>
              <Controller
                name="receiptType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ?? RECEIPT_TYPES.BANK_TRANSFER}
                    invalid={!!errors.receiptType}
                  >
                    {RECEIPT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.receiptType && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.receiptType.message}
                </Text>
              )}
            </Field>

            <Field>
              <Label>收款金額 *</Label>
              <Controller
                name="receiptAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="請輸入收款金額"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? Number(value) : 0);
                    }}
                    invalid={!!errors.receiptAmount}
                  />
                )}
              />
              {errors.receiptAmount && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.receiptAmount.message}
                </Text>
              )}
            </Field>

            <Field>
              <Label>實收金額 *</Label>
              <Controller
                name="actualAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="實際收到的金額"
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? Number(value) : 0);
                    }}
                    invalid={!!errors.actualAmount}
                  />
                )}
              />
              {errors.actualAmount && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.actualAmount.message}
                </Text>
              )}
            </Field>

            {/* 根據收款方式條件顯示欄位 */}
            {receiptType === RECEIPT_TYPES.BANK_TRANSFER && (
              <Field>
                <Label>收款帳號 *</Label>
                <Controller
                  name="receiptAccount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="銀行轉帳付款方式必須填寫收款帳號"
                      value={field.value ?? ''}
                      invalid={!!errors.receiptAccount}
                    />
                  )}
                />
                {errors.receiptAccount && (
                  <Text className="text-red-600 text-sm mt-1">
                    {errors.receiptAccount.message}
                  </Text>
                )}
              </Field>
            )}

            {receiptType === RECEIPT_TYPES.LINK_PAY && (
              <>
                <Field>
                  <Label>收款帳號 *</Label>
                  <Controller
                    name="receiptAccount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="LinkPay 付款方式必須填寫收款帳號"
                        value={field.value ?? ''}
                        invalid={!!errors.receiptAccount}
                      />
                    )}
                  />
                  {errors.receiptAccount && (
                    <Text className="text-red-600 text-sm mt-1">
                      {errors.receiptAccount.message}
                    </Text>
                  )}
                </Field>

                <Field>
                  <Label>電子郵件 *</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="email"
                        placeholder="LinkPay 付款方式必須填寫 Email"
                        value={field.value ?? ''}
                        invalid={!!errors.email}
                      />
                    )}
                  />
                  {errors.email && (
                    <Text className="text-red-600 text-sm mt-1">
                      {errors.email.message}
                    </Text>
                  )}
                </Field>

                <Field>
                  <Label>付款截止日 *</Label>
                  <Controller
                    name="payDateline"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        invalid={!!errors.payDateline}
                      />
                    )}
                  />
                  {errors.payDateline && (
                    <Text className="text-red-600 text-sm mt-1">
                      {errors.payDateline.message}
                    </Text>
                  )}
                </Field>
              </>
            )}

            <Field>
              <Label>狀態 *</Label>
              <Controller
                name="status"
                control={control}
                defaultValue={RECEIPT_STATUS.PENDING}
                render={({ field }) => (
                  <Select
                    {...field}
                    value={field.value ?? RECEIPT_STATUS.PENDING}
                    invalid={!!errors.status}
                  >
                    {RECEIPT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.status && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.status.message}
                </Text>
              )}
            </Field>

            <Field className="md:col-span-2">
              <Label>備註</Label>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="請輸入備註"
                    value={field.value ?? ''}
                    invalid={!!errors.note}
                  />
                )}
              />
              {errors.note && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.note.message}
                </Text>
              )}
            </Field>
          </div>
        )}
      </DialogBody>
      <DialogActions>
        <Button color="zinc" onClick={onClose}>
          取消
        </Button>
        <Button
          type="submit"
          color="blue"
          disabled={isLoading || !isValid || !isDirty || isCreating}
        >
          <CheckIcon />
          <span className="ml-1">儲存</span>
        </Button>
      </DialogActions>
    </>
  );
}

export default ReceiptByOrderForm;