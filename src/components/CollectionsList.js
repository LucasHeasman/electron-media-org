import React from 'react';
import { Container, Button, Badge } from 'reactstrap';

class CollectionsList extends React.Component {
  render() {
    let buttons;
    if (this.props && this.props.collections && this.props.collections.length) {
      buttons = (this.props.collections).map((object, index) => {
        if (this.props.collectionsLoading) {
          return (
            <div key={object.collectionName}>
              <Button disabled color="secondary" outline onClick={this.props.setCollection} value={object.collectionName}>{object.collectionName} <Badge color="secondary">{object.totalFiles}</Badge></Button>
              <br />
            </div>
          )
        } else {
          return (
            <div key={object.collectionName}>
              <Button color="secondary" outline onClick={this.props.setCollection} value={object.collectionName}>{object.collectionName} <Badge color="secondary">{object.totalFiles}</Badge></Button>
            </div>
          )
        }
      });
    } else {
      buttons = <div>No collections found</div>
    }

    return (
      <Container fluid={true}>
        {buttons}
      </Container>
    )
  }
}

export default CollectionsList;
