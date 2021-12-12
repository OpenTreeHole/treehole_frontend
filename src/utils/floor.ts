import { WrappedHole } from '@/models/hole'
import { camelizeKeys, sleep } from '@/utils/utils'
import { EventBus } from '@/event-bus'
import Mention from '@/components/hole/Mention.vue'
import vuetify from '@/plugins/vuetify'
import Vue from 'vue'
import UtilStore from '@/store/modules/UtilStore'
import { Main } from '@/main'
import { VueInstance } from '@/instance'
import { Floor, MarkedDetailedFloor, MarkedFloor } from '@/models/floor'

export async function renderFloor (curFloor: MarkedDetailedFloor, toMention: (mentionFloor: MarkedFloor) => void, idPrefix: string = 'fl'): Promise<void> {
  if (('mention' in curFloor) && curFloor.mention.length !== 0) {
    await Vue.nextTick()
    renderMention(curFloor, toMention, idPrefix)
  }
}

export const scrollToFloor = (toIndex: number): void => {
  EventBus.$emit('scroll-to-floor', toIndex)
}

function mapMention (mentionAttrs: string[], mention: Floor[]): Map<string, MarkedFloor> {
  const map = new Map<string, MarkedFloor>()
  const sortedMentionAttrs = mentionAttrs.sort(a => (a[1] === '#' ? 1 : 0))
  const mentionC = Array.from(mention)
  for (const mentionAttr of sortedMentionAttrs) {
    let mentionFloor: Floor | undefined
    if (mentionAttr[1] === '#') { // Means it's a floor mention. e.g. ##88258
      mentionFloor = mentionC.find(v => v.floorId === parseInt(mentionAttr.substring(2)))
    } else { // It's a hole mention. e.g. #10000
      mentionFloor = mentionC.find(v => v.holeId === parseInt(mentionAttr.substring(1)))
    }
    if (!mentionFloor) continue
    const index = mentionC.indexOf(mentionFloor)
    mentionC.splice(index, 1)
    map.set(mentionAttr, new MarkedFloor(mentionFloor))
  }
  return map
}

/**
 * Render the empty divs with 'replyDiv' class and 'mention' attr with the specific floor.
 * <p> This method should be called after the original divs being rendered. </p>
 *
 * @param curFloor - the current floor (waiting the mention part in it to be re-rendered).
 * @param toMention
 * @param idPrefix
 */
export function renderMention (curFloor: MarkedDetailedFloor, toMention: (mentionFloor: MarkedFloor) => void, idPrefix: string): void {
  const elements = document.querySelectorAll(`div#${idPrefix}-${curFloor.floorId} > div.replyDiv`)

  const mentionAttrs: string[] = []
  elements.forEach(el => {
    if (el.innerHTML) return
    const mentionAttr = el.getAttribute('mention')
    if (!mentionAttr) return
    mentionAttrs.push(mentionAttr)
  })

  const mentionMap = mapMention(mentionAttrs, curFloor.mention)

  for (let i = 0; i < elements.length; i++) {
    if (elements[i].innerHTML) continue
    const mentionAttr = elements[i].getAttribute('mention')
    if (!mentionAttr) continue

    const mentionFloor: MarkedFloor | undefined = mentionMap.get(mentionAttr)
    if (!mentionFloor) continue

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
        gotoMentionFloor: () => { toMention(mentionFloor) },
        gotoMentionFloorIcon: 'mdi-arrow-collapse-up',
        mentionFloorInfo: '#' + mentionFloor.floorId,
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

export function gotoHole (holeIdOrHole: number | WrappedHole, floorId?: number, toIndex?: number) {
  const holeId = (typeof holeIdOrHole === 'number') ? holeIdOrHole : holeIdOrHole.holeId
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
    if (floorId === undefined) EventBus.$emit('goto-hole', holeIdOrHole)
    else if (toIndex === undefined) EventBus.$emit('goto-hole', holeIdOrHole, floorId)
    else EventBus.$emit('goto-hole', holeIdOrHole, floorId, toIndex)
  }
}

export async function openDivisionAndGotoHole (holeId: number, floorId?: number, toIndex?: number) {
  if (UtilStore.isMobile) gotoHole(holeId, floorId, toIndex)
  else {
    const response = await VueInstance.$axios?.get(`/holes/${holeId}`)
    const hole = new WrappedHole(camelizeKeys(response.data))
    const path = `/division/${hole.divisionId}`
    if (Main.$route.path !== path) {
      await Main.$router.push(path)
      await sleep(500)
    }
    gotoHole(hole, floorId, toIndex)
  }
}
