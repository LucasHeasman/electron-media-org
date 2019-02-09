import React from 'react';
import { Container } from 'reactstrap';
import CollectionComponent from '../components/CollectionComponent';

class VideoCollectionPage extends React.Component {
  render() {
    return (
      <Container>
        <CollectionComponent fileType="video" />
      </Container>
    )
  }
}

export default VideoCollectionPage;