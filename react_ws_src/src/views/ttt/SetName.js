import React, {Component} from 'react'

export default class SetName extends Component {

	constructor (props) {
		super(props)

		this.state = {}
	}

//	------------------------	------------------------	------------------------

	render () {
		return (
			<div id='SetName'>

				<h1>Set Name</h1>

				<form>
  				<div ref='nameHolder' className='input_holder left'>
  					<label>Name </label>
  					<input ref='name' type='text' className='input name' placeholder='Name' required />
  				</div>


  				<button type='submit' onClick={this.saveName.bind(this)} className='button'><span>SAVE <span className='fa fa-caret-right'></span></span></button>
				</form>

			</div>
		)
	}

//	------------------------	------------------------	------------------------

	saveName (e) {
		// const { name } = this.refs
		// const { onSetName } = this.props
		// onSetName(name.value.trim())
    e.preventDefault();
		this.props.onSetName(this.refs.name.value.trim())
	}

}
