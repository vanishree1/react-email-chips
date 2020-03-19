import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ChipsList from './ChipsList';
import './chips.css';

class Chips extends Component {
	constructor(props) {
		super(props);
		this.state = {
			chips: [],
			KEY: {
				backspace: 8,
				tab: 9,
				enter: 13
			},
			disableInput: false
		};
		this.inputRef = React.createRef();
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.chips.length === 0) {
			
			const disableInput =  nextProps.limit && nextProps.limit <= nextProps.chips.length;
			return { chips: nextProps.chips, disableInput, limitValidation: disableInput };
		}
		return null;
	}

	focusInput() {
		this.inputRef.current && this.inputRef.current.focus();
	}

	componentDidMount() {
		this.setChips(this.props.chips, false);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.chips.length !== this.props.chips.length)
			this.setChips(this.props.chips, false);
	}

	setChips(chips, save) {
		if ((this.props.required && chips.length) || (!this.props.required && chips)) {
			const validChips = this.getValidChips(chips);
			const disableInput = this.props.limit && this.props.limit <= validChips.length;			
			
			this.setState({ chips, limitValidation: disableInput, disableInput }, this.focusInput);
			
			if (save) {
				this.props.save(validChips);
			}
		}
	}

	getValidChips(chips) {
		return chips.filter(chip => chip.valid);
	}

	onKeyDown(event) {
		const keyPressed = event.which;
		let inputText = event.target.value;
		const isComma = inputText.substr(-1) === ',';
		this.clearRequiredValidation();
		if (
			keyPressed === this.state.KEY.enter ||
			(keyPressed === this.state.KEY.tab && event.target.value) ||
			isComma
		) {
			event.preventDefault();
			this.updateChips(event);
		} else if (keyPressed === this.state.KEY.backspace) {
			const chips = this.state.chips;

			if (!event.target.value && chips.length) {
				this.deleteChip(chips[chips.length - 1]);
			}
		}
	}

	clearRequiredValidation() {
		this.setState({
			requiredValidation: false
		});
	}

	deleteChip(removedChip) {
		if (!removedChip) {
			return;
		}
		if (this.props.required && removedChip.valid && this.isOnlyOneValidChip()) {
			this.setState({
				requiredValidation: true
			});
			return;
		}else{
		const chips = this.state.chips.filter(chip => chip.key !== removedChip.key);

		this.setChips(chips, removedChip.valid);
		return true;
		}
		
	}

	isOnlyOneValidChip() {
		return this.getValidChips(this.state.chips).length <= 1;
	}

	updateChips(event) {
		
		let value = event.target.value;

		if (value.substr(-1) === ',') {
			value = value.slice(0, -1);
		}

		if (!value) {
			return;
		}

		const chipValue = value.trim().toLowerCase();

		// check if it is already exists
		const [chipExists] = this.state.chips.filter(chip => chip.email === chipValue);

		if (chipExists) {
			// @todo maybe get/set it on state
			event.target.value = '';
			return;
		}

		const valid = this.props.pattern ? this.props.pattern.test(chipValue) : true;
		const chips = this.state.chips.concat([{ email: chipValue, valid, key: Date.now() }]);

		this.setChips(chips, valid);

		event.target.value = '';
	}

	render() {
		let placeholder =
			!this.props.max || this.state.chips.length < this.props.max ? this.props.placeholder : '';
		return (
			<div>
				<div className="chips-header">
					<span className="chips-title">{this.props.title}</span>
				
					<span className="chips-validation-message">
						<span	
								className={classNames({visible: this.state.requiredValidation,
								hidden: !this.state.requiredValidation
							})}
						>
							{this.props.requiredMessage}
						</span>
						
					</span>
				</div>
				<div className="chips" onClick={() => this.focusInput()}>
					<ChipsList chips={this.state.chips} onChipClick={(event, chip) => {event.stopPropagation(); this.deleteChip(chip)}} />
					{ !this.state.disableInput && <input
						type="text"
						className="chips-input"
						onFocus={() => this.clearRequiredValidation()}
						placeholder={placeholder}
						onKeyDown={e => this.onKeyDown(e)}
						onChange={e => this.onKeyDown(e)}
						onBlur={e => this.updateChips(e)}
						ref={this.inputRef}
					/>}
				</div>
				<div className="chips-warning-message">
				
				<span
							className={classNames({
								visible: this.state.limitValidation,
								hidden: !this.state.limitValidation
							})}
						>
						<span className='mark'>!</span>	{this.props.limitMessage}
						</span>
				</div>
			</div>
		);
	}
}

Chips.propTypes = {
	chips: PropTypes.array,
	title: PropTypes.string,
	save: PropTypes.func,
	placeholder: PropTypes.string,
	pattern: PropTypes.instanceOf(RegExp),
	required: PropTypes.bool,
	requiredMessage: PropTypes.string,
	limit: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	limitMessage: PropTypes.string
};

Chips.defaultProps = {
	// eslint-disable-next-line
	pattern: new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i)
}

export default Chips;
