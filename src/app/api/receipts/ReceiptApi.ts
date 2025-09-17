// ===== 類型定義 =====

export interface LinkPayLog {
	receiptNumber: string;
	linkpayOrderNumber: string;
	price: number;
	endDate: Date;
	link: string;
	status: number;
	paymentName: string;
	createdAt: Date;
	createdBy: string;
	modifiedAt: Date;
	modifiedBy: string;
}

export interface Receipt {
	receiptNumber: string; // 收款編號 (主鍵)
	orderNumber: string; // 訂單編號
	receiptDate: Date; // 收款日期
	receiptAmount: number; // 收款金額
	actualAmount: number; // 實際收款金額
	receiptType: number; // 收款方式
	receiptAccount: string; // 收款帳號
	payDateline: Date; // 付款截止日
	email: string; // 信箱
	note: string; // 說明
	status: number; // 狀態
	createdAt: Date; // 創建日期
	createdBy: string; // 創建人員
	modifiedAt: Date; // 修改日期
	modifiedBy: string; // 修改人員
	groupCode?: string; // 團號
	groupName?: string; // 團名
	linkpay?: LinkPayLog[]; // LinkPay 資訊
	[key: string]: unknown;
}

// 擴展查詢參數
export interface ReceiptQueryParams {
	receiptNumber?: string;
	orderNumber?: string;
	groupCode?: string;
	status?: number[];
	receiptType?: number[];
	startDate?: string;
	endDate?: string;
	limit?: number;
}

// LinkPay 請求參數
export interface CreateLinkPayRequest {
	receiptNumber: string;
	userName: string;
	email: string;
	createUser: string;
	paymentName: string;
}

export interface CreateLinkPayResponse {
	success: boolean;
	message?: string;
	data?: LinkPayLog;
}