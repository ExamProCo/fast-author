import stream from 'mithril/stream'

class Data
  constructor:->
    # The root directory where all the markdown files are stored
    # eg. ~/fast-author/
    @home = stream('')

    # When the current file was last saved
    @last_saved = stream('')

    # the file that shows selecte in the right hand column
    @active_file = stream(null)

    # files that appear in the right hand column
    @files  = stream([])

    # assets that appear in the right hand column
    # assets only for the current markdown file that is active
    @assets  = stream([])

    # The currently selected image in the markdown to apply editing
    @active_asset = stream null

    # the contents of the markdown file
    @document = stream('')

    # whether the meta key is being held eg. Command on Mac
    @meta = stream(false)

    # whether the shift key is behind held
    @shift = stream(false)

    # whether to wrap or not wrap lines in textarea
    @line_wrap = stream(false)
    #
    # whether to split the view (show both editor or preview, or just editor)
    @splitview = stream(true)

    # when true will hide editor and center preview.
    @publisher_preview = stream(false)

    # the start and end select for markdown textarea
    @selectionStart = stream false
    @selectionEnd   = stream false

    # current selections for infobar
    @_selectionStart = stream 0
    @_selectionEnd   = stream 0
  markdown_path:(name)=>
    path = "#{@home()}/#{name}/index.md"
    console.log path
    path
  # select can be loss after certain updates to textarea.
  # This ensures our old selection remains
  keep_selection:=>
    Data.selectionStart Data._selectionStart()
    Data.selectionEnd Data._selectionEnd()
  get_asset:=>
    asset = null
    for a in @assets()
      if a.path is @active_asset().replace('file://','')
        asset = a
        break
    asset
export default new Data()
