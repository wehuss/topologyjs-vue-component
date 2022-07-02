import { ComponentPublicInstance } from "vue";
import {Pen} from '@topology/core'

export interface VuePen extends Pen {
  vueComponentInstance:ComponentPublicInstance
  rendered:boolean
}