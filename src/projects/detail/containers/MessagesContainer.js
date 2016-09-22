import _ from 'lodash'
import React from 'react'
import { connect } from 'react-redux'
import MessageList from '../../../components/MessageList/MessageList'
import MessageDetails from '../../../components/MessageDetails/MessageDetails'
import NewPost from '../../../components/Feed/NewPost'
import { loadDashboardFeeds, createProjectTopic, loadFeedComments, addFeedComment } from '../../actions/projectTopics'
import { Sticky } from 'react-sticky'

class MessagesContainer extends React.Component {

  constructor(props) {
    super(props)
    this.state = { threads : [], activeThreadId : null }
    this.onThreadSelect = this.onThreadSelect.bind(this)
    this.onLoadMoreMessages = this.onLoadMoreMessages.bind(this)
    this.onAddNewMessage = this.onAddNewMessage.bind(this)
    this.onNewMessageChange = this.onNewMessageChange.bind(this)
    this.onNewThread = this.onNewThread.bind(this)
  }

  componentWillMount() {
    // if (!this.props.threads) {
      this.props.loadDashboardFeeds(this.props.project.id)
    // }
  }

  componentWillReceiveProps(nextProps) {
    this.init(nextProps)
  }

  init(props) {
    const { allMembers } = props
    const { activeThreadId } = this.state
    const activeThreadIndex = activeThreadId
      ? _.findIndex(this.state.threads, (thread) => thread.id === activeThreadId )
      : 0
    this.setState({
      threads: props.threads.map((thread, idx) => {
        const item = { ...thread, isActive : idx === activeThreadIndex }
        if (item.userId === 'system') {
          item.user = {
            firstName: 'Coder',
            lastName: 'Bot'
          }
          item.allowComments = false
        } else {
          item.allowComments = true
          item.user = _.find(allMembers, mem => mem.userId === item.userId)
        }

        // TODO remove hardcoded check for hasMoreMessages
        item.hasMoreMessages = false
        item.html = item.posts.length > 0 ? item.posts[0].body : null
        item.messages = item.posts ? item.posts : []
        item.messages.forEach((message) => {
          message.content = message.body
          if (message.userId === 'system') {
            message.author = {
              firstName: 'Coder',
              lastName: 'Bot'
            }
          } else {
            message.author = _.find(allMembers, mem => mem.userId === message.userId)
          }
        })

        // reset newMessage property
        item.newMessage = ''
        return item
      })
    })
  }

  onThreadSelect(thread) {
    this.setState({
      isCreateNewMessage: false,
      activeThreadId: thread.id,
      threads: this.state.threads.map((item) => {
        if (item.isActive) {
          if (item.id === thread.id) {
            return item
          }
          return {...item, isActive: false, messages: item.messages.map((msg) => ({...msg, unread: false}))}
        }
        if (item.id === thread.id) {
          return {...item, isActive: true, unreadCount: 0}
        }
        return item
      })
    })
  }

  onNewMessageChange(content) {
    this.setState({
      threads: this.state.threads.map((item) => {
        if (item.isActive) {
          return {...item, newMessage: content}
        }
        return item
      })
    })
  }

  // this method is not ready yet, however, it is not used right now because messaging
  // api is not supporting paging yet
  onLoadMoreMessages() {
    const { threads, activeThreadId } = this.state
    const thread = _.find(threads, thread => thread.id === activeThreadId)
    if (thread.posts && thread.posts.length < thread.totalComments) {
      const loadFromIndex = thread.posts.length
      this.setState(update(this.state, {
        loadingFeedComments: { feedId : { $set : true}}
      }))
      this.props.loadFeedComments(activeThreadId, loadFromIndex)
    }
  }

  onAddNewMessage(threadId, content) {
    const { currentUser } = this.props
    const newMessage = {
      date: new Date(),
      userId: parseInt(currentUser.id),
      content
    }
    this.props.addFeedComment(threadId, 'MESSAGES', newMessage)
  }

  onNewThread({title, content}) {
    const threads = this.state.threads.map((item) => ({...item, isActive: false}))
    const { project } = this.props
    const newThread = {
      title,
      body: content,
      tag: 'MESSAGES'
    }
    this.props.createProjectTopic(project.id, newThread).then(() => {
      this.setState({
        isCreateNewMessage : false
      })
    })
  }

  render() {
    const {threads, isCreateNewMessage} = this.state
    const { currentUser, isCreatingFeed } = this.props
    const activeThread = threads.filter((item) => item.isActive)[0]

    const renderRightPanel = () => {
      if (isCreateNewMessage) {
        return (<NewPost
          currentUser={currentUser}
          onPost={this.onNewThread}
          isCreating={isCreatingFeed}
        />)
      } else if (activeThread) {
        return (<MessageDetails
          {...activeThread}
          onLoadMoreMessages={this.onLoadMoreMessages}
          onNewMessageChange={this.onNewMessageChange}
          onAddNewMessage={ this.onAddNewMessage.bind(this, activeThread.id) }
          currentUser={currentUser}
        />)
      } else {
        // TODO show some placeholder card
      }
    }

    return (
      <div className="container" style={{display: 'flex', width: '1110px', margin: '20px auto'}}>
        <div style={{width: '360px', marginRight: '30px'}}>
          <Sticky>
            <MessageList
              onAdd={() => this.setState({isCreateNewMessage: true})}
              threads={threads}
              onSelect={this.onThreadSelect}
            />
          </Sticky>
        </div>
        <div style={{width: '720px'}}>
          { renderRightPanel() }
        </div>
      </div>
    )
  }
}
const mapStateToProps = ({ projectTopics, members, loadUser }) => {
  return {
    currentUser: loadUser.user,
    threads    : _.values(projectTopics.feeds['MESSAGES']),
    isCreatingFeed : projectTopics.isCreatingFeed,
    isLoading  : projectTopics.isLoading,
    error      : projectTopics.error,
    allMembers : _.values(members.members)
  }
}
const mapDispatchToProps = {
  loadDashboardFeeds,
  createProjectTopic,
  loadFeedComments,
  addFeedComment
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesContainer)