import React from 'react';
import { Container } from 'reactstrap';
import CollectionComponent from '../components/CollectionComponent';

class ImageCollectionPage extends React.Component {
  render() {
    return (
      <Container>
        <CollectionComponent fileType="image" />
      </Container>
    )
  }
}

export default ImageCollectionPage;