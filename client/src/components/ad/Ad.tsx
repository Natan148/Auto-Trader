/* eslint react/prop-types: 0 */
import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container/Container';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import EngineIcon from '../../images/engine.png';
import MilesIcon from '../../images/miles.png';
import FuelIcon from '../../images/fuel.png';
import '../../../node_modules/react-image-gallery/styles/css/image-gallery.css';
import './ad.css';
import Gallery from './Gallery';
import { AdDetails } from './ad.interface';

interface Props {
  details: AdDetails;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    heading: {
      fontSize: theme.typography.pxToRem(25),
      flexBasis: '33.33%',
      flexShrink: 0,
      display: 'inline-table',
    },
    secondaryHeading: {
      fontSize: theme.typography.pxToRem(15),
      color: theme.palette.text.secondary,
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    paper: {
      backgroundColor: '#313c53',
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
      width: '80%',
    },
  })
);

const Ad: React.FC<Props> = (props) => {
  const details = props.details;
  const classes = useStyles();
  const [expanded, setExpanded] = useState<string | false>(false);

  return (
    <Container
      style={{
        width: '800px',
        marginBottom: '15px',
      }}
    >
      <div className={classes.root}>
        <ExpansionPanel expanded={expanded === 'panel1'}>
          <ExpansionPanelSummary
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <IconButton
              id="expandIcon"
              aria-haspopup="true"
              color="inherit"
              onClick={() =>
                expanded ? setExpanded(false) : setExpanded('panel1')
              }
            >
              {expanded ? (
                <ExpandLessIcon fontSize="large" />
              ) : (
                <ExpandMoreIcon fontSize="large" />
              )}
            </IconButton>
            <Gallery photos={details.photos} />
            <div className="summeryContent">
              <h3 className="carHeader">{details.heading}</h3>
              <IconButton
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '5px',
                }}
                className="saveIcon"
                aria-haspopup="true"
                color="inherit"
              >
                <FavoriteBorderIcon />
              </IconButton>
              <table>
                <thead>
                  <tr>
                    <td>
                      <img className="carIcon" src={EngineIcon} />
                    </td>
                    <td>
                      <img className="carIcon" src={MilesIcon} />
                    </td>
                    <td>
                      <img className="carIcon" src={FuelIcon} />
                    </td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="carDetail">{details.engine_size}</td>
                    <td className="carDetail">{details.miles}</td>
                    <td className="carDetail">{details.fuel_type}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Typography>
              Nulla facilisi. Phasellus sollicitudin nulla et quam mattis
              feugiat. Aliquam eget maximus est, id dignissim quam.
            </Typography>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    </Container>
  );
};

export default Ad;
