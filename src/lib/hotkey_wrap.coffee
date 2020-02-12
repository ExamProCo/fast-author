import {find_line} from 'lib/hotkey_util'

# TODO - Edge Cases
# - spanning multiple lines
# - no selection
export default class HotkeyWrap
  @insert:(value,start_at,end_at,str_start,str_end)=>
    lines = value.split("\n")
    [start_index,start_char] = find_line lines, start_at
    [end_index  ,end_char]   = find_line lines, end_at

    # The brown fox XjumpsY over the fence.
    local_start = start_at-start_char
    console.log
      start_len: lines[start_index].length
      end_len: lines[end_index].length
    console.log
      start_index: start_index
      end_index: end_index
    console.log
      start_char: start_char
      end_char: end_char
    console.log
      start_at: start_at
      end_at:  end_at
    console.log
      local_start: local_start

    # The brown fox X
    start_sub_0 = lines[start_index].substring 0, local_start
    console.log(['The brown fox X',lines[start_index].substring 0, local_start])
    # jumpsY over the fence.
    start_sub_1 = lines[start_index].substring local_start, lines[start_index].length
    console.log(['jumpsY over the fence.',start_at,lines[start_index].substring start_at, lines[start_index].length])
    # The brown fox **
    start_sub_0 += str_start
    console.log(['The brown fox **',start_sub_0])

    # The brown fox **jumYps over the fence.
    lines[start_index] =  [start_sub_0,start_sub_1].join('')
    console.log(['The brown fox **jumYps over the fence.',[start_sub_0,start_sub_1].join('')])

    console.log('end_at:prev',end_at)
    # The endSelection shifted 2
    end_at += str_start.length if start_index is end_index
    console.log('end_at:shifted',end_at)

    local_end =  end_at-end_char
    console.log
      local_end: local_end

    # The brown fox **jumpsY
    end_sub_0 = lines[end_index].substring 0, local_end
    console.log(['The brown fox **jumpsY',lines[end_index].substring 0, local_end])
    # over the fence.
    end_sub_1 = lines[end_index].substring local_end, lines[end_index].length
    console.log(['over the fence.',lines[end_index].substring local_end, lines[end_index].length])
    # The brown fox **jumps**
    end_sub_0 += str_end
    console.log(['The brown fox **jumps**',end_sub_0])
    # The brown fox **jumps** over the fence.
    lines[end_index] = [end_sub_0,end_sub_1].join('')
    console.log(['The brown fox **jumps** over the fence.',[end_sub_0,end_sub_1].join('')])

    console.log("<><><><><><><><><><>")
    new_start_at = start_at + str_start.length
    new_end_at   = end_at   + str_end.length
    data =
      value: lines.join("\n")
      selectionStart: new_start_at
      selectionEnd  : new_end_at
