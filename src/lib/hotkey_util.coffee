# returns [index,char]
#  - index is the position in the array
#  - char is the is the accumlative character count to the start of the line.
#    so we can calulate offset
export find_line = (lines, value)->
  index = false
  prev_count = 0
  count = 0
  for line,i in lines
    prev_count = count
    count += line.length+1
    if value <= count
      index = i
      break
  [index, prev_count]
