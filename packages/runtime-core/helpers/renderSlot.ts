import { createVnode, Fragment } from '../src/vnode'

export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    return createVnode(Fragment, {}, slot(props))
  }
}
