'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Trash2, Eye, Edit } from 'lucide-react'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { Select } from '@/components/catalyst/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/catalyst/table'
import { Badge } from '@/components/catalyst/badge'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/catalyst/dialog'
import { groupsAPI, Group, GROUP_STATUS_NAMES, GROUP_STATUS_COLORS, calculateGroupDuration, isGroupUpcoming, isGroupOngoing } from '@/lib/api/groups'
import { toast } from 'react-hot-toast'

export default function GroupsPage() {
  // ===== 狀態管理 =====
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  // 搜尋和篩選
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<number | 'all'>('all')
  const [salesPersonFilter, setSalesPersonFilter] = useState('')

  // 分頁
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const limit = 20

  // Modal 狀態
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null)
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  // ===== 資料載入 =====
  useEffect(() => {
    loadGroups()
  }, [currentPage, searchTerm, statusFilter, salesPersonFilter])

  const loadGroups = async () => {
    try {
      setLoading(true)

      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? Number(statusFilter) : undefined,
        salesPerson: salesPersonFilter || undefined
      }

      const response = await groupsAPI.getGroups(currentPage, limit, filters)

      if (response.success) {
        setGroups(response.data)
        setTotalPages(response.meta.totalPages)
        setTotalRecords(response.meta.total)
      } else {
        toast.error(response.message || '載入旅遊團失敗')
      }
    } catch (error) {
      console.error('載入旅遊團錯誤:', error)
      toast.error('載入旅遊團失敗')
    } finally {
      setLoading(false)
    }
  }

  // ===== 事件處理 =====

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // 重置到第一頁
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? 'all' : Number(value))
    setCurrentPage(1)
  }

  const handleSalesPersonFilter = (value: string) => {
    setSalesPersonFilter(value)
    setCurrentPage(1)
  }

  const handleSelectGroup = (groupCode: string, selected: boolean) => {
    if (selected) {
      setSelectedGroups([...selectedGroups, groupCode])
    } else {
      setSelectedGroups(selectedGroups.filter(code => code !== groupCode))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedGroups(groups.map(group => group.groupCode))
    } else {
      setSelectedGroups([])
    }
  }

  const handleViewGroup = (group: Group) => {
    setSelectedGroup(group)
    setShowGroupDialog(true)
  }

  const handleEditGroup = (group: Group) => {
    // TODO: 實作編輯功能
    toast.success(`編輯 ${group.groupName}`)
  }

  const handleDeleteGroup = (groupCode: string) => {
    setGroupToDelete(groupCode)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!groupToDelete) return

    try {
      const response = await groupsAPI.deleteGroup(groupToDelete)

      if (response.success) {
        toast.success('旅遊團刪除成功')
        await loadGroups()
        setSelectedGroups(selectedGroups.filter(code => code !== groupToDelete))
      } else {
        toast.error(response.message || '刪除失敗')
      }
    } catch (error) {
      console.error('刪除旅遊團錯誤:', error)
      toast.error('刪除失敗')
    } finally {
      setShowDeleteDialog(false)
      setGroupToDelete(null)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedGroups.length === 0) {
      toast.error('請選擇要刪除的旅遊團')
      return
    }

    if (!confirm(`確定要刪除 ${selectedGroups.length} 個旅遊團嗎？`)) {
      return
    }

    try {
      const response = await groupsAPI.deleteGroups(selectedGroups)

      if (response.success) {
        toast.success(`成功刪除 ${response.data.deleted.length} 個旅遊團`)
        if (response.data.failed.length > 0) {
          toast.error(`${response.data.failed.length} 個旅遊團刪除失敗`)
        }
      } else {
        toast.error('批量刪除失敗')
      }

      await loadGroups()
      setSelectedGroups([])
    } catch (error) {
      console.error('批量刪除錯誤:', error)
      toast.error('批量刪除失敗')
    }
  }

  const handleExport = async () => {
    try {
      // TODO: 實作匯出功能
      toast.success('匯出功能開發中')
    } catch (error) {
      console.error('匯出錯誤:', error)
      toast.error('匯出失敗')
    }
  }

  // ===== 輔助函數 =====

  const getGroupStatusBadge = (status: number) => {
    const statusName = GROUP_STATUS_NAMES[status] || '未知'
    const colorClass = GROUP_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'

    return (
      <Badge className={colorClass}>
        {statusName}
      </Badge>
    )
  }

  const getGroupTimeBadge = (group: Group) => {
    if (isGroupUpcoming(group.departureDate)) {
      return <Badge className="bg-blue-100 text-blue-800">即將出發</Badge>
    } else if (isGroupOngoing(group.departureDate, group.returnDate)) {
      return <Badge className="bg-orange-100 text-orange-800">進行中</Badge>
    } else {
      return <Badge className="bg-gray-100 text-gray-800">已結束</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // ===== 渲染組件 =====

  return (
    <div className="h-full">
      {/* 標題區域 - 遵守 15px 邊距規範 */}
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              旅遊團管理
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              管理旅遊團資料，追蹤出團狀況和獎金計算
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button outline onClick={handleExport}>
              <Download size={16} />
              匯出
            </Button>
            {selectedGroups.length > 0 && (
              <Button color="red" onClick={handleBatchDelete}>
                <Trash2 size={16} />
                刪除選取 ({selectedGroups.length})
              </Button>
            )}
            <Button>
              <Plus size={16} />
              新增旅遊團
            </Button>
          </div>
        </div>
      </div>

      {/* 內容容器 */}
      <div className="mx-auto max-w-6xl">
        {/* 搜尋和篩選區 */}
        <div className="border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <Input
                type="text"
                placeholder="搜尋團號或團名..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                icon={Search}
              />
            </div>
            <Select
              value={statusFilter.toString()}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="all">所有狀態</option>
              <option value="0">進行中</option>
              <option value="1">已結團</option>
              <option value="2">特殊團</option>
            </Select>
            <Input
              type="text"
              placeholder="業務員篩選..."
              value={salesPersonFilter}
              onChange={(e) => handleSalesPersonFilter(e.target.value)}
              className="w-48"
            />
          </div>
        </div>

        {/* 表格內容區 */}
        <div className="px-8 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-zinc-500">載入中...</div>
            </div>
          ) : (
            <>
              {/* 統計資訊 */}
              <div className="mb-6 text-sm text-zinc-600 dark:text-zinc-300">
                共 {totalRecords} 個旅遊團 • 第 {currentPage} 頁，共 {totalPages} 頁
              </div>

              {/* 表格 */}
              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedGroups.length === groups.length && groups.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-zinc-300"
                        />
                      </TableHead>
                      <TableHead>團號</TableHead>
                      <TableHead>團名</TableHead>
                      <TableHead>出發日期</TableHead>
                      <TableHead>回程日期</TableHead>
                      <TableHead>天數</TableHead>
                      <TableHead>人數</TableHead>
                      <TableHead>業務員</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>時間狀態</TableHead>
                      <TableHead className="w-32">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.groupCode}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group.groupCode)}
                            onChange={(e) => handleSelectGroup(group.groupCode, e.target.checked)}
                            className="rounded border-zinc-300"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {group.groupCode}
                        </TableCell>
                        <TableCell className="font-medium">
                          {group.groupName}
                        </TableCell>
                        <TableCell>
                          {formatDate(group.departureDate)}
                        </TableCell>
                        <TableCell>
                          {formatDate(group.returnDate)}
                        </TableCell>
                        <TableCell>
                          {calculateGroupDuration(group.departureDate, group.returnDate)} 天
                        </TableCell>
                        <TableCell>
                          {group.customerCount} 人
                        </TableCell>
                        <TableCell>
                          {group.salesPerson || '-'}
                        </TableCell>
                        <TableCell>
                          {getGroupStatusBadge(group.status)}
                        </TableCell>
                        <TableCell>
                          {getGroupTimeBadge(group)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button plain onClick={() => handleViewGroup(group)}>
                              <Eye size={16} />
                            </Button>
                            <Button plain onClick={() => handleEditGroup(group)}>
                              <Edit size={16} />
                            </Button>
                            <Button
                              plain
                              color="red"
                              onClick={() => handleDeleteGroup(group.groupCode)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 分頁 */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">
                    顯示第 {(currentPage - 1) * limit + 1} 到 {Math.min(currentPage * limit, totalRecords)} 項，共 {totalRecords} 項
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      outline
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      上一頁
                    </Button>
                    <span className="text-sm text-zinc-600 dark:text-zinc-300">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      outline
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      下一頁
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 刪除確認 Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>確認刪除</DialogTitle>
        <DialogDescription>
          確定要刪除這個旅遊團嗎？此操作無法復原。
        </DialogDescription>
        <DialogActions>
          <Button plain onClick={() => setShowDeleteDialog(false)}>
            取消
          </Button>
          <Button color="red" onClick={confirmDelete}>
            刪除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 旅遊團詳情 Dialog */}
      <Dialog open={showGroupDialog} onClose={() => setShowGroupDialog(false)} size="2xl">
        <DialogTitle>旅遊團詳情</DialogTitle>
        <DialogBody>
          {selectedGroup && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    團號
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-white font-mono">
                    {selectedGroup.groupCode}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    團名
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                    {selectedGroup.groupName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    出發日期
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                    {formatDate(selectedGroup.departureDate)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    回程日期
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                    {formatDate(selectedGroup.returnDate)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    旅客人數
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                    {selectedGroup.customerCount} 人
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    業務員
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                    {selectedGroup.salesPerson || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    OP員
                  </label>
                  <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                    {selectedGroup.opId || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    狀態
                  </label>
                  <div className="mt-1">
                    {getGroupStatusBadge(selectedGroup.status)}
                  </div>
                </div>
              </div>

              {/* 獎金資訊 */}
              {(selectedGroup.branchBonus || selectedGroup.saleBonus || selectedGroup.opBonus) && (
                <div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
                    獎金設定
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        分公司獎金
                      </label>
                      <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                        {selectedGroup.branchBonus || 0}%
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        業務獎金
                      </label>
                      <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                        {selectedGroup.saleBonus || 0}%
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        OP獎金
                      </label>
                      <div className="mt-1 text-sm text-zinc-900 dark:text-white">
                        {selectedGroup.opBonus || 0}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 旅客清單 */}
              {selectedGroup.travellerIds && selectedGroup.travellerIds.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
                    旅客清單 ({selectedGroup.travellerIds.length} 人)
                  </h3>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">
                      {selectedGroup.travellerIds.join(', ')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setShowGroupDialog(false)}>
            關閉
          </Button>
          <Button onClick={() => selectedGroup && handleEditGroup(selectedGroup)}>
            編輯
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}