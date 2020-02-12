import {find_line} from 'lib/hotkey_util'

export default class HotkeyHeading
  @prepend_str:(level)=>
    str = ''
    for i in [1..level]
      str += '#'
    str += ' '
    str
  @insert:(value,level,start_at)=>
    lines = value.split("\n")
    str   = @prepend_str level
    [index,char] = find_line lines, start_at
    console.log index, char

    if lines[index].match(/^#+/) # heading already exists
      result = lines[index].match(/^#+/)

      if result[0].length is level # same heading so lets remove it
        result = lines[index].match(/^#+\s*/)
        regex = new RegExp "^#{result[0]}"
        lines[index] = lines[index].replace(regex,'')
        new_start_at = start_at - result[0].length
      else # different heading so lets replace it
        # we need to include the spaces
        result = lines[index].match(/^#+\s*/)
        regex = new RegExp "^#{result[0]}"
        lines[index] = lines[index].replace(regex,str)

        new_start_at = start_at + (str.length - result[0].length)
    else # add a new heading
      lines[index] = "#{str}#{lines[index]}"
      new_start_at = start_at+str.length

    data =
      value         : lines.join("\n")
      selectionStart: new_start_at
      selectionEnd  : new_start_at
