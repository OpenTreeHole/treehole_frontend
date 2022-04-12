import { Hole } from '@/models/hole'
import { sleep } from '@/utils/utils'
import { EventBus } from '@/event-bus'
import MentionCard from '@/components/card/MentionCard.vue'
import vuetify from '@/plugins/vuetify'
import Vue from 'vue'
import UtilStore from '@/store/modules/UtilStore'
import { Main } from '@/main'
import { DetailedFloor, Floor, IFloor } from '@/models/floor'
import BaseComponentOrView from '@/mixins/BaseComponentOrView.vue'
import { getHole } from '@/apis/api'

export async function renderFloor (parent: BaseComponentOrView, curFloor: DetailedFloor, toMention: (mentionFloor: Floor) => void, idPrefix: string = 'fl'): Promise<void> {
  if (('mention' in curFloor) && curFloor.mention.length !== 0) {
    await Vue.nextTick()
    renderMention(parent, curFloor, toMention, idPrefix)
  }
}

export const scrollToFloor = (toIndex: number): void => {
  EventBus.$emit('scroll-to-floor', toIndex)
}

function mapMention (mentionAttrs: string[], mention: IFloor[]): Map<string, Floor> {
  const map = new Map<string, Floor>()
  const sortedMentionAttrs = mentionAttrs.sort(a => (a[1] === '#' ? 1 : 0))
  const mentionC = Array.from(mention)
  for (const mentionAttr of sortedMentionAttrs) {
    let mentionFloor: IFloor | undefined
    if (mentionAttr[1] === '#') { // Means it's a floor mention. e.g. ##88258
      mentionFloor = mentionC.find(v => v.floorId === parseInt(mentionAttr.substring(2)))
    } else { // It's a hole mention. e.g. #10000
      mentionFloor = mentionC.find(v => v.holeId === parseInt(mentionAttr.substring(1)))
    }
    if (!mentionFloor) continue
    const index = mentionC.indexOf(mentionFloor)
    mentionC.splice(index, 1)
    map.set(mentionAttr, new Floor(mentionFloor))
  }
  return map
}

/**
 * Render the empty divs with 'replyDiv' class and 'mention' attr with the specific floor.
 * <p> This method should be called after the original divs being rendered. </p>
 *
 * @param parent
 * @param curFloor - the current floor (waiting the mention part in it to be re-rendered).
 * @param toMention
 * @param idPrefix
 */
export function renderMention (parent: BaseComponentOrView, curFloor: DetailedFloor, toMention: (mentionFloor: Floor) => void, idPrefix: string): void {
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

    const mentionFloor: Floor | undefined = mentionMap.get(mentionAttr)
    if (!mentionFloor) continue

    new MentionCard({
      propsData: {
        mentionFloor: mentionFloor,
        gotoMentionFloor: () => {
          toMention(mentionFloor)
        },
        gotoMentionFloorIcon: 'mdi-arrow-collapse-up',
        mentionFloorInfo: mentionAttr,
        additionalClass: {
          'mt-3': elements[i].parentElement && (elements[i].parentElement as HTMLElement).firstChild !== elements[i],
          'mb-3': elements[i].parentElement && (elements[i].parentElement as HTMLElement).lastChild !== elements[i]
        }
      },
      parent: parent,
      vuetify
    }).$mount(elements[i])
  }
}

export function gotoMentionFloor (curFloor: DetailedFloor, mentionFloor: Floor) {
  if (!UtilStore.isMobile) EventBus.$emit('goto-mention-floor', curFloor, mentionFloor)
  else gotoHole(mentionFloor.holeId, mentionFloor.floorId)
}

export function gotoHole (holeIdOrHole: number | Hole, floorId?: number, toIndex?: number) {
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
    EventBus.$emit('goto-hole', holeIdOrHole, floorId, toIndex)
  }
}

export async function openDivisionAndGotoHole (holeId: number, floorId?: number, toIndex?: number) {
  if (UtilStore.isMobile) gotoHole(holeId, floorId, toIndex)
  else {
    const hole = await getHole(holeId)
    const path = `/division/${hole.divisionId}`
    if (Main.$route.path !== path) {
      await Main.$router.push(path)
      await sleep(500)
    }
    gotoHole(hole, floorId, toIndex)
  }
}
