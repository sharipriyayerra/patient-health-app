import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import Payments from './Payments'
import HealthServices from '../../services/HealthServices';
import './Billing.scss';

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#3e9aea',
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

export default class PatientBillingTransactions extends React.Component {
  constructor(props) {
    super(props);
    this.HealthServices = new HealthServices();
    this.state = {
      rows: [],
      paymentPage: false,
      paymentData: []
    };
    this.fetchPatientDetails('');
  }

  fetchPatientDetails = (sort) => {
    this.HealthServices.fetchPatientDetails(sort, (result) => {
      this.setState({
        rows: result,
        paymentPage: false,
        paymentData: []
      });
    });
  }

  fetchPatientDetaildById = (id) => {
    this.HealthServices.fetchPatientDetaildById(id, (result) => {
      this.showPaymentDetails(result);
    });
  }

  addPaymentTransactions = (paymentTrans, patient_id) => {
    this.HealthServices.addPaymentTransactions(paymentTrans, patient_id, (result) => {
      this.fetchPatientDetaildById(result.patient_detailId);
    });
  }

  searchDetails = () => {
    const fromDate = this.fromDate.value;
    let toDate = this.toDate.value;
    let sort = ''

    if (fromDate && toDate) {
      sort = 'appointment_date_gte=' + fromDate + '&appointment_date_lte=' + toDate;
    } else if (fromDate) {
      sort = 'appointment_date_gte=' + fromDate;
    }
    this.fetchPatientDetails(sort);
  }

  showPaymentDetails = (paymentData) => {
    this.setState({
      paymentPage: true,
      paymentData: paymentData
    })
  };

  renderBilling = () => (<div>
    <h4>View Appointment</h4>
    <div className="filter">
          <div>
            <label>From Date</label>
            <input
              type="date"
              ref={(fromDate) => {
                this.fromDate = fromDate;
              }}
            />
          </div>
          <div>
            <label>To Date</label>
            <input
              type="date"
              ref={(toDate) => {
                this.toDate = toDate;
              }}
            />
          </div>
          <div>
            <input
              className="searchBtn"
              type="button"
              value="Search"
              ref={(searchAction) => {
                this.searchAction = searchAction;
              }}
              onClick={this.searchDetails}
            />
          </div>
        </div>
        <TableContainer component={Paper} >
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>S.No</StyledTableCell>
                <StyledTableCell align="left">Patient Name</StyledTableCell>
                <StyledTableCell align="center">Age-Gender</StyledTableCell>
                <StyledTableCell align="center">Appointment Date</StyledTableCell>
                <StyledTableCell align="center">Balance Amount</StyledTableCell>
                <StyledTableCell align="center">Action</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.rows.map((row, index) => (
                <StyledTableRow key={row.scan_name}>
                  <StyledTableCell component="th" scope="row">
                    {index + 1}
                  </StyledTableCell>
                  <StyledTableCell align="left">{row.name}</StyledTableCell>
                  <StyledTableCell align="center">{`${row.age} - ${row.gender}`}</StyledTableCell>
                  <StyledTableCell align="center">{row.appointment_date}</StyledTableCell>
                  <StyledTableCell align="center">{(row.patient_tests.length) ? row.patient_tests[0].balance_due : 0}</StyledTableCell>
                  <StyledTableCell align="center">
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => {
                        // props.deleteBillingOption(row.scan_name, index);
                          this.showPaymentDetails(row);
                      }}
                    >
                      Click to Pay
                </Link>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
  </div>);

  render() {
    let view = this.renderBilling();
    if(this.state.paymentPage) {
      view = (<Payments data={this.state.paymentData} addPaymentTransactions={this.addPaymentTransactions} />)
    }

    return (
      <div>
        {view}
      </div>
    );
  }
}