import { createVnode } from '../vnode'

export function renderSlots(slots, name, props) {
  const slot = slots[name]
  if (slot) {
    return createVnode('div', {}, slot(props))
  }
}
