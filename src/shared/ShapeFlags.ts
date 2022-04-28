// 为了高效采用位运算
export const enum ShapeFlags {
  ELEMENT = 1, // 0001 element类型
  STATEFUL_COMPONENT = 1 << 1, // 0010  组件类型
  TEXT_CHILDREN = 1 << 2, // 0100  文本节点
  ARRAY_CHILDREN = 1 << 3, // 1000  数组
  SLOT_CHILDREN = 1 << 4, // 10000
}
