## Adds a numeric co-occurrence edge property to downloaded Tulip Graphs, incorrectly encoded in edge labels.
##


from tulip import tlp

# The updateVisualization(centerViews = True) function can be called
# during script execution to update the opened views

# The pauseScript() function can be called to pause the script execution.
# To resume the script execution, you will have to click on the "Run script " button.

# The runGraphScript(scriptFile, graph) function can be called to launch
# another edited script on a tlp.Graph object.
# The scriptFile parameter defines the script name to call (in the form [a-zA-Z0-9_]+.py)

# The main(graph) function must be defined 
# to run the script on the current graph

def main(graph): 
  TagTagSelection = graph.getStringProperty("TagTagSelection")
  color = graph.getStringProperty("color")
  entityType = graph.getStringProperty("entityType")
  id_ = graph.getStringProperty("id")
  label = graph.getStringProperty("label")
  labelEdgeTlp = graph.getStringProperty("labelEdgeTlp")
  labelsNodeTlp = graph.getStringProperty("labelsNodeTlp")
  name = graph.getStringProperty("name")
  occ = graph.getStringProperty("occ")
  postsOrCommentsAssociateNodeTlp = graph.getStringProperty("postsOrCommentsAssociateNodeTlp")
  read_cam0size = graph.getStringProperty("read_cam0:size")
  read_cam0x = graph.getStringProperty("read_cam0:x")
  read_cam0y = graph.getStringProperty("read_cam0:y")
  renderer1size = graph.getStringProperty("renderer1:size")
  renderer1x = graph.getStringProperty("renderer1:x")
  renderer1y = graph.getStringProperty("renderer1:y")
  size = graph.getStringProperty("size")
  source = graph.getStringProperty("source")
  tag_1 = graph.getStringProperty("tag_1")
  tag_2 = graph.getStringProperty("tag_2")
  tag_id = graph.getStringProperty("tag_id")
  target = graph.getStringProperty("target")
  tmpIDNode = graph.getStringProperty("tmpIDNode")
  type_ = graph.getStringProperty("type")
  usersAssociateNodeTlp = graph.getStringProperty("usersAssociateNodeTlp")
  viewBorderColor = graph.getColorProperty("viewBorderColor")
  viewBorderWidth = graph.getDoubleProperty("viewBorderWidth")
  viewColor = graph.getColorProperty("viewColor")
  viewFont = graph.getStringProperty("viewFont")
  viewFontSize = graph.getIntegerProperty("viewFontSize")
  viewIcon = graph.getStringProperty("viewIcon")
  viewLabel = graph.getStringProperty("viewLabel")
  viewLabelBorderColor = graph.getColorProperty("viewLabelBorderColor")
  viewLabelBorderWidth = graph.getDoubleProperty("viewLabelBorderWidth")
  viewLabelColor = graph.getColorProperty("viewLabelColor")
  viewLabelPosition = graph.getIntegerProperty("viewLabelPosition")
  viewLayout = graph.getLayoutProperty("viewLayout")
  viewMetric = graph.getDoubleProperty("viewMetric")
  viewRotation = graph.getDoubleProperty("viewRotation")
  viewSelection = graph.getBooleanProperty("viewSelection")
  viewShape = graph.getIntegerProperty("viewShape")
  viewSize = graph.getSizeProperty("viewSize")
  viewSrcAnchorShape = graph.getIntegerProperty("viewSrcAnchorShape")
  viewSrcAnchorSize = graph.getSizeProperty("viewSrcAnchorSize")
  viewTexture = graph.getStringProperty("viewTexture")
  viewTgtAnchorShape = graph.getIntegerProperty("viewTgtAnchorShape")
  viewTgtAnchorSize = graph.getSizeProperty("viewTgtAnchorSize")
  x = graph.getStringProperty("x")
  y = graph.getStringProperty("y")
  
  def add_co_occurrence(g):
    '''
    (Tulip graph) => None
    adds to g a numeric property encoding  the number of co-occurrence of codes for each edge. 
    This is now incorrectly encoded in the labels.
    '''
    co_occ = graph.getIntegerProperty('co-occ')
    for e in graph.getEdges():
      label = labelEdgeTlp[e] # read the property, shaped like this: occ (1.0)
      value = int(label[5: len(label)-3]) # take only the part of the label between
      co_occ[e] = value
      
  def format_occurrence(g):
    '''
    adds to g a numeric property encoding the number of occurrences for each node.
    This is now incorrectly represented as a string property.
    '''
    num_occ = graph.getIntegerProperty('num_occ')
    for n in graph.getNodes():
      num_occ[n] = int(occ[n])/10
      
  # add_co_occurrence(graph)
  format_occurrence(graph)
    
    
      
