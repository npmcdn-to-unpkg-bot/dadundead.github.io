'use strict';

console.log('DOMContentLoaded body:', document.body)

let data = [
  {id: 1, author: "Pete Hunt", text: "This is one comment"},
  {id: 2, author: "Jordan Walke", text: "This is *another* comment"}
]

const CommentBox = React.createClass({
  loadCommentsFromServer: function(){
    $.ajax({
      url:this.props.url,
      dataType:'json',
      cache:false,
      success: (data) => this.setState({data:data}),
      error: (xhr, status, err) =>
        console.error(this.props.url, status, err.toString())
    })
  },
  handleCommentSubmit:function(comment){
    //submit to server
    const comments = this.state.data
    comment.id=Date.now();
    const newComments = comments.concat([comment])
    this.setState({data:newComments})
    console.log('submit to server:',comment)
    $.ajax({
      url:this.props.url,
      dataType:'json',
      type:'POST',
      data:comment,
      success:(data)=> this.setState({data:data}),
      error: (xhr, status, err) =>{
        this.setState({data:comments})
        console.error(this.props.url, status, err.toString())
      }
    })
  },
  getInitialState: function(){
    return {data:[]}
  },
  componentDidMount: function(){
    this.loadCommentsFromServer()
    setInterval(this.loadCommentsFromServer, this.props.pollInterval)
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    )
  }
})

const CommentList = React.createClass({
  render: function() {
    let commentNodes = this.props.data.map(function(comment){
      return(
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      )
    })
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    )
  }
})

const CommentForm = React.createClass({
  getInitialState: function(){
    return {author:'', text:''}
  },
  handleAuthorChange: function(e){
    this.setState({author: e.target.value})
  },
  handleTextChange: function(e){
    this.setState({text: e.target.value})
  },
  handleSubmit: function(e){
    e.preventDefault()
    const author = this.state.author.trim()
    const text = this.state.text.trim()
    if (!text||!author) return
    //send to server here
    this.props.onCommentSubmit({author:author, text:text})
    this.setState({author:'', text:''})
  },
  render: function() {
    return (
      <div className="commentForm">
        <form className="commentForm" onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={this.state.author}
            onChange={this.handleAuthorChange}
          />
          <input
            type="text"
            placeholder="Say smth"
            value={this.state.text}
            onChange={this.handleTextChange}
          />
          <input type="submit" value="Post"/>
        </form>
      </div>
    )
  }
})

const Comment = React.createClass({
  rawMarkup: function(){
    const md = new Remarkable()
    const rawMarkup = md.render(this.props.children.toString())
    return {__html:rawMarkup}
  },
  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()}/>
      </div>
    )
  }
})

ReactDOM.render(
  <CommentBox url="./api/comments.json" pollInterval={2000}/>,
  document.getElementById('content')
)
