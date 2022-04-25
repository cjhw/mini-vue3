const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
}

export const publicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState } = instance
    // 从setupState里取值
    if (key in setupState) {
      return setupState[key]
    }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }
  },
}
