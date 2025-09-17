import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useState } from 'react';

import { Input, InputGroup } from '@/components/catalyst/input';
import { Select } from '@/components/catalyst/select';
import { Textarea } from '@/components/catalyst/textarea';
import { Field, Label } from '@/components/catalyst/fieldset';
import { Text } from '@/components/catalyst/text';
import { Badge } from '@/components/catalyst/badge';
import { Divider } from '@/components/catalyst/divider';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@/components/catalyst/combobox';

import { RECEIPT_TYPE_OPTIONS, RECEIPT_TYPES } from '@/constants/receiptTypes';
import { RECEIPT_STATUS_NAMES, RECEIPT_STATUS_COLORS } from '@/constants/receiptStatus';
import LinkPayExpandableRow from '@/app/(app)/receipts/LinkPayExpandableRow';

import { useGetOrdersQuery } from '../../../hooks/useOrderAPI';
import { useUser, FuseUtils, authRoles } from '../../../hooks/useAuth';

function BasicInfoTab() {
  const { data: user } = useUser();
  const userRole = user?.roles || [];
  const methods = useFormContext();
  const { control, formState, getValues, watch } = methods;
  const { errors } = formState;
  const [linkPayInfoOpen, setLinkPayInfoOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 監控 receiptType 以條件性顯示欄位
  const receiptType = useWatch({
    control,
    name: 'receiptType'
  });

  const status = watch('status');
  const { data: orders = [] } = useGetOrdersQuery();

  const orderOptions = orders.map((order) => ({
    value: order.orderNumber,
    label: `${order.orderNumber} - ${order.groupName} - ${order.contactPerson}`
  }));

  // 獲取表單中的 linkpay 資訊
  const formValues = getValues();
  const hasLinkPayInfo = receiptType === RECEIPT_TYPES.LINK_PAY;

  // 檢查是否為新收據
  const isNewReceipt = !formValues.receiptNumber || formValues.receiptNumber === 'new';

  // 處理 LinkPay 創建成功後的回調
  const handleLinkPayCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field>
          <Label>收款單號</Label>
          <Controller
            name="receiptNumber"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                disabled
                placeholder="系統自動產生"
              />
            )}
          />
        </Field>

        <Field>
          <Label>訂單編號 *</Label>
          <Controller
            name="orderNumber"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value || null}
                onChange={(value) => field.onChange(value)}
                invalid={!!errors.orderNumber}
              >
                <ComboboxInput
                  placeholder="選擇訂單"
                  displayValue={(value: string) => {
                    const option = orderOptions.find(opt => opt.value === value);
                    return option ? option.label : value || '';
                  }}
                />
                <ComboboxButton />
                <ComboboxOptions>
                  {orderOptions.map((option) => (
                    <ComboboxOption key={option.value} value={option.value}>
                      {option.label}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </Combobox>
            )}
          />
          {errors.orderNumber && (
            <Text className="text-red-600 text-sm mt-1">
              {errors.orderNumber.message as string}
            </Text>
          )}
        </Field>

        <Field>
          <Label>付款方式 *</Label>
          <Controller
            name="receiptType"
            control={control}
            defaultValue={-1}
            render={({ field }) => (
              <Select
                {...field}
                value={field.value ?? -1}
                invalid={!!errors.receiptType}
              >
                <option value={-1}>請選擇付款方式</option>
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
              {errors.receiptType.message as string}
            </Text>
          )}
        </Field>

        <Field>
          <Label>收款日期 *</Label>
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
              {errors.receiptDate.message as string}
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
                  placeholder="請輸入收款帳號"
                  invalid={!!errors.receiptAccount}
                />
              )}
            />
            {errors.receiptAccount && (
              <Text className="text-red-600 text-sm mt-1">
                {errors.receiptAccount.message as string}
              </Text>
            )}
          </Field>
        )}

        {receiptType === RECEIPT_TYPES.LINK_PAY && (
          <>
            <Field>
              <Label>姓名 *</Label>
              <Controller
                name="receiptAccount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="請輸入姓名"
                    invalid={!!errors.receiptAccount}
                  />
                )}
              />
              {errors.receiptAccount && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.receiptAccount.message as string}
                </Text>
              )}
            </Field>

            <Field>
              <Label>付款名稱</Label>
              <Controller
                name="paymentName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="請輸入付款名稱"
                    invalid={!!errors.paymentName}
                  />
                )}
              />
              {errors.paymentName && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.paymentName.message as string}
                </Text>
              )}
            </Field>

            <Field>
              <Label>信箱 *</Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder="請輸入 Email"
                    invalid={!!errors.email}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.email.message as string}
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
                  {errors.payDateline.message as string}
                </Text>
              )}
            </Field>
          </>
        )}

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
                value={field.value || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value ? Number(value) : null);
                }}
                invalid={!!errors.receiptAmount}
              />
            )}
          />
          {errors.receiptAmount && (
            <Text className="text-red-600 text-sm mt-1">
              {errors.receiptAmount.message as string}
            </Text>
          )}
        </Field>

        <Field>
          <Label>實收金額</Label>
          <Controller
            name="actualAmount"
            control={control}
            defaultValue={0}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                placeholder="實際收到的金額"
                value={field.value || ''}
                disabled={
                  receiptType === RECEIPT_TYPES.LINK_PAY ||
                  !FuseUtils.hasPermission(authRoles.accountant, userRole)
                }
                onChange={(e) => {
                  const value = e.target.value;
                  field.onChange(value ? Number(value) : null);
                }}
              />
            )}
          />
        </Field>

        {!isNewReceipt && (
          <Field>
            <Label>狀態</Label>
            <div className="flex items-center gap-2">
              <Badge color={RECEIPT_STATUS_COLORS[status] || 'gray'}>
                {RECEIPT_STATUS_NAMES[status] || '未知狀態'}
              </Badge>
            </div>
          </Field>
        )}

        <Field className="md:col-span-2">
          <Label>說明</Label>
          <Controller
            name="note"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                rows={4}
                placeholder="請輸入說明"
                invalid={!!errors.note}
              />
            )}
          />
          {errors.note && (
            <Text className="text-red-600 text-sm mt-1">
              {errors.note.message as string}
            </Text>
          )}
        </Field>
      </div>

      {/* LinkPay 資訊區塊 */}
      {hasLinkPayInfo && !isNewReceipt && (
        <div className="mt-6" key={refreshKey}>
          <Divider className="mb-4" />
          <div className="flex justify-between items-center mb-4">
            <Text className="text-lg font-medium">
              LinkPay 付款資訊
            </Text>
          </div>
          <LinkPayExpandableRow
            receipt={formValues}
            linkpayData={
              Array.isArray(formValues.linkpay)
                ? formValues.linkpay
                : formValues.linkpay
                  ? [formValues.linkpay]
                  : []
            }
            paymentName={formValues.paymentName}
            open={true}
            onToggle={() => setLinkPayInfoOpen(!linkPayInfoOpen)}
            onLinkPayCreated={handleLinkPayCreated}
          />
        </div>
      )}
    </div>
  );
}

export default BasicInfoTab;