import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { withFirebase } from '../../Firebase';
import * as ROUTES from '../../../constants/routes';

class FloorList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      floors: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.floors().on('value', (snapshot) => {
      const floorsObject = snapshot.val();

      const floorsList = Object.keys(floorsObject).map((key) => ({
        ...floorsObject[key],
        uid: key,
      }));

      this.setState({
        floors: floorsList,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    this.props.firebase.floors().off();
  }

  render() {
    const { floors, loading } = this.state;

    return (
      <div className="add-padding-bottom">
        <h2>Floor List</h2>
        {loading && <div>Loading ...</div>}
        <ul>
          {floors.map((floor) => (
            <li key={floor.id}>
              <span>
                <strong>Title:</strong> {floor.floorName}
              </span>
              <br />
              <span>
                <strong>Location:</strong> {floor.floorLocation}
              </span>
              <br />
              <div className="row">
                <div className="mr-3">
                  <Link
                    to={{
                      pathname: `${ROUTES.FLOORS}/${floor.id}`,
                      state: { floor },
                    }}
                  >
                    Details
                  </Link>
                </div>
                {/* <div>
                  <Link
                    to={{
                      pathname: `${ROUTES.ROOMS}/${floor.id}`,
                      state: { floor },
                    }}
                  >
                    Rooms / Spaces
                  </Link>
                </div> */}
              </div>
              <hr />
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default withFirebase(FloorList);