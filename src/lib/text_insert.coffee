import Data from 'common/data'
import {find_line} from 'lib/hotkey_util'

# Insert text at in document
export default class TextInsert
  @at:(text)=>
    target   = document.getElementById('editor')
    start_at = target.selectionStart
    lines = Data.document().split("\n")
    [index,char] = find_line lines, start_at
    local = start_at-char
    sub_0  = lines[index].substring 0, local
    sub_0 += text
    sub_1 = lines[index].substring local, lines[index].length
    lines[index] = [sub_0,sub_1].join('')
    Data.document lines.join('\n')
