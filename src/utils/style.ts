import UtilStore from '@/store/modules/UtilStore'

export const dialogWidth = () => {
  return UtilStore.isMobile ? '98vw' : '70vw'
}
