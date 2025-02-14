import { combineReducers } from 'redux'
import searchTerm from './searchTerm'
import loadUser from './loadUser'
import { projectState } from '../projects/reducers/project'
import { projectDashboard } from '../projects/reducers/projectDashboard'
import { projectTopics } from '../projects/reducers/projectTopics'
import { phasesTopics } from '../projects/reducers/phasesTopics'
import { productsTimelines } from '../projects/reducers/productsTimelines'
import { projectSummary } from '../projects/reducers/projectSummary'
import navSearch from './navSearch'
import projectSearch from '../projects/reducers/projectSearch'
import projectSearchSuggestions from '../projects/reducers/projectSearchSuggestions'
import members from './members'
import alerts from './alerts'
import notifications from '../routes/notifications/reducers'
import settings from '../routes/settings/reducers'
import templates from './templates'

export default combineReducers({
  loadUser,
  navSearch,
  searchTerm,
  projectSearch,
  projectSearchSuggestions,
  projectState,
  members,
  projectDashboard,
  projectTopics,
  projectSummary,
  phasesTopics,
  alerts,
  notifications,
  settings,
  templates,
  productsTimelines,
})
