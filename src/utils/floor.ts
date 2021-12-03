import { Floor, MarkedDetailedFloor, MarkedFloor } from '@/api/hole'
import { scrollTo } from '@/utils'
import { EventBus } from '@/event-bus'
import Mention from '@/components/hole/Mention.vue'
import vuetify from '@/plugins/vuetify'
import Vue from 'vue'
import FloorListMixin from '@/mixins/FloorListMixin.vue'
import UtilStore from '@/store/modules/UtilStore'
import { Main } from '@/main'

export async function renderFloor (curFloor: MarkedDetailedFloor, floorList?: FloorListMixin): Promise<void> {
  if (('mention' in curFloor) && curFloor.mention.length !== 0) {
    await Vue.nextTick()
    renderMention(curFloor, floorList)
  }
}

/**
 * Render the empty divs with 'replyDiv' class and 'mention' attr with the specific floor.
 * <p> This method should be called after the original divs being rendered. </p>
 *
 * @param curFloor - the current floor (waiting the mention part in it to be re-rendered).
 * @param floorList -
 */
export function renderMention (curFloor: MarkedDetailedFloor, floorList?: FloorListMixin): void {
  const curIndex = floorList?.getIndex(curFloor.floorId) ?? -1
  const elements = document.querySelectorAll('div[index="' + curIndex + '"] > div.replyDiv')
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].innerHTML) continue
    const mentionAttr = elements[i].getAttribute('mention')
    if (!mentionAttr) continue
    const mentionId = parseInt(mentionAttr.substring(1))
    let mentionFloorOrNull: Floor | null = null
    curFloor.mention.forEach((mFloor) => {
      if (mFloor.floorId === mentionId) mentionFloorOrNull = mFloor
    })
    if (!mentionFloorOrNull) continue
    const mentionFloor: MarkedFloor = new MarkedFloor(mentionFloorOrNull)
    let gotoMentionFloorF: Function | undefined
    const mentionIndex = floorList?.getIndex(mentionId) ?? -1
    if (mentionIndex !== -1) {
      gotoMentionFloorF = () => {
        scrollTo(curIndex, mentionIndex)
      }
    } else if (curIndex !== -1) {
      gotoMentionFloorF = () => {
        gotoMentionFloor(curFloor, mentionFloor)
      }
    } else {
      gotoMentionFloorF = () => {
        gotoHole(curFloor.holeId, curFloor.floorId)
      }
    }
    let additionalClass = ''
    if (elements[i].parentElement && (elements[i].parentElement as HTMLElement).firstChild !== elements[i]) {
      additionalClass += 'mt-3 '
    }
    if (elements[i].parentElement && (elements[i].parentElement as HTMLElement).lastChild !== elements[i]) {
      additionalClass += 'mb-3 '
    }
    additionalClass = additionalClass.trimEnd()
    new Mention({
      propsData: {
        mentionFloor: mentionFloor,
        gotoMentionFloor: gotoMentionFloorF,
        gotoMentionFloorIcon: 'mdi-arrow-collapse-up',
        mentionFloorInfo: (mentionIndex === -1 ? ('#' + mentionFloor.floorId) : (mentionIndex.toString() + 'L')),
        additionalClass: additionalClass
      },
      vuetify
    }).$mount(elements[i])
  }
}

export function gotoMentionFloor (curFloor: MarkedDetailedFloor, mentionFloor: MarkedFloor) {
  if (!UtilStore.isMobile) EventBus.$emit('goto-mention-floor', curFloor, mentionFloor)
  else gotoHole(mentionFloor.holeId, mentionFloor.floorId)
}

export function gotoHole (holeId: number, floorId?: number, toIndex?: number) {
  if (UtilStore.isMobile) {
    if (floorId !== undefined) {
      Main.$router.push({
        path: `/hole/${holeId}`,
        query: { mention: floorId.toString() }
      })
    } else {
      Main.$router.push({
        path: `/hole/${holeId}`
      })
    }
  } else {
    if (floorId === undefined) EventBus.$emit('goto-hole', holeId)
    else if (toIndex === undefined) EventBus.$emit('goto-hole', holeId, floorId)
    else EventBus.$emit('goto-hole', holeId, floorId, toIndex)
  }
}
