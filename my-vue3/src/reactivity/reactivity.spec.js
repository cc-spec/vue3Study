import { effect } from '../effect'
import { reactive } from '../reactive'

describe('响应式测试', () => {
  test('reactive基本使用', () => {
    const res = reactive({num:0})
    let val 
    effect(() => {
      val = res.num
    })
    expect(val).toBe(0)
    res.num++
    expect(val).toBe(1)
    res.num = 10
    expect(val).toBe(10)
  })
})