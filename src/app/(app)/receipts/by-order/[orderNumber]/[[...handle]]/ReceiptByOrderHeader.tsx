import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/catalyst/button';
import { Heading } from '@/components/catalyst/heading';
import { Text } from '@/components/catalyst/text';
import { ArrowLeftIcon } from '@heroicons/react/16/solid';

type ReceiptByOrderHeaderProps = {
  orderNumber: string;
};

function ReceiptByOrderHeader({ orderNumber }: ReceiptByOrderHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-2 sm:space-y-0 py-6 sm:py-8">
      <div className="flex flex-col items-start space-y-2 sm:space-y-0 w-full sm:max-w-full min-w-0">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
        >
          {/* Breadcrumb placeholder */}
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
              訂單 {orderNumber} 的收款清單
            </Heading>
            <Text className="text-sm font-medium text-zinc-500">
              收款清單詳情
            </Text>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
      >
        <Button
          color="zinc"
          outline
          href="/receipts"
        >
          <ArrowLeftIcon />
          <span className="ml-2">返回列表</span>
        </Button>
      </motion.div>
    </div>
  );
}

export default ReceiptByOrderHeader;