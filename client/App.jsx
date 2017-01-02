'use strict';

import React, { DOM } from 'react'
import Product from './components/product';

var div = DOM.div,
    button = DOM.button,
    ul = DOM.ul,
    li = DOM.li;

module.exports = React.createClass({
  displayName: 'exports',

  getInitialState: function getInitialState() {
    return { items: this.props.items, disabled: true };
  },

  componentDidMount: function componentDidMount() {
    this.setState({ disabled: false });
  },

  handleClick: function handleClick() {
    this.setState({
      items: this.state.items.concat('Item ' + this.state.items.length)
    });
  },

  render: function render() {
    var products = this.state.items.map(function(item) {
      return <Product product={item} />
    });

    return <div>{products}</div>
  }
});