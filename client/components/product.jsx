import React, { Component } from 'react';
import ReactDOM from 'react-dom';
 
export default class Product extends Component {
  render() {
    return <div className="product">{this.props.product.brandedName}</div>;
  }
}