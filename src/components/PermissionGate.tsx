import { usePermissions, type Permission } from '@/hooks/usePermissions'

interface PermissionGateProps {
  children: React.ReactNode
  permission?: Permission | string
  permissions?: (Permission | string)[]
  requireAll?: boolean  // true = 需要所有權限, false = 任一權限即可
  fallback?: React.ReactNode
}

/**
 * 權限保護元件
 * 
 * 使用範例：
 * <PermissionGate permission="mode.work">
 *   <WorkModeContent />
 * </PermissionGate>
 * 
 * <PermissionGate permissions={['orders.create', 'orders.update']} requireAll>
 *   <OrderManagement />
 * </PermissionGate>
 */
export function PermissionGate({ 
  children, 
  permission, 
  permissions, 
  requireAll = false,
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, loading } = usePermissions()

  // 載入中
  if (loading) {
    return <div className="text-zinc-500">檢查權限中...</div>
  }

  // 檢查權限
  let hasAccess = false
  
  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(...permissions)
      : hasAnyPermission(...permissions)
  } else {
    // 沒有指定權限要求，直接顯示
    hasAccess = true
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * 權限檢查 HOC (Higher Order Component)
 * 
 * 使用範例：
 * const AdminPanel = withPermission(AdminPanelComponent, 'system.admin')
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission | string,
  fallback?: React.ReactNode
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <PermissionGate permission={permission} fallback={fallback}>
        <Component {...props} />
      </PermissionGate>
    )
  }
}
