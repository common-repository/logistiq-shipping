import React, {useState, useEffect, useMemo, useCallback} from 'react';

import axios from "axios";
import store from "store-js";
import { Alert, AlertTitle, Box, Button, Collapse, Fade, Grid, LinearProgress, Snackbar, Typography } from '@mui/material';
import {DataGrid, GridActionsCellItem, useGridApiRef} from '@mui/x-data-grid';
import LoadingButton from '@mui/lab/LoadingButton';
import PrintIcon from '@mui/icons-material/Print';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import moment from 'moment/moment.js';
import fileDownload from "js-file-download";
import WhereToVoteIcon from '@mui/icons-material/WhereToVote';
import PlaceIcon from '@mui/icons-material/Place';

function FWD_OrderPage({setIsAuthenticated, setFwdCount}) {
    const [fwbOrders, setFwbOrders] = useState([]);
    const [linerLoader, setLinerLoader] = useState(true);
    const [circularLoading, setCircularLoading] = useState(false);
    const [selectionModel, setSelectionModel] = useState([]);
    const apiRef = useGridApiRef;
    const [snakeState, setSnakeState] = useState({
        open: false,
        Transition: Fade
    });

    const [successBanner, setSuccessBanner] = useState(false);
    const [errorBanner, setErrorBanner] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (fwbOrders) {
          setFwbOrders(fwbOrders);
        }
      }, [fwbOrders]);

      useEffect(() => {
        setLinerLoader(linerLoader);
      }, [linerLoader]);

    useEffect(() => {
      setCircularLoading(circularLoading);
    }, [circularLoading]);
    

    useEffect(() => {
        const timer = setTimeout(()=> {
            setSuccessBanner(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, [successBanner]);

    useEffect(() => {
        const timer = setTimeout(()=> {
            setErrorBanner(false);
        }, 15000);
        return () => clearTimeout(timer);
    }, [errorBanner]);

    useEffect(() => {
        setSuccessMsg(successMsg);
      }, [successMsg]);

    useEffect(() => {
        setErrorMsg(errorMsg);
    }, [errorMsg]);
    
    
      useEffect(() => {
        fetchFwbOrders();
      }, []);

    const handleSnakeBarClose = () => {
        setSnakeState({
            ...snakeState,
            open: false
        })
    };

    const fetchFwbOrders = async () => {
        const params = "delivery_type=FORWARD&page_size=50";
        const stored_user = store.get("user");
        if (stored_user) {
          const token = stored_user.token;
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };
          const response = await axios
            .get(
              "https://hawklive.logistiq.io/allocation/api/v1/tracking/order-list?" +
                params,
              {
                headers: headers,
              }
            )
            .catch((err) => {
              getNewToken(err, stored_user, "1");
            });
          if (response) {
            console.log('orders', response.data);
            setFwdCount(response.data.count);
            buildResponse(response.data.results);
            setLinerLoader(false);
          }
        }
    };

    function buildResponse(data) {
        const res_data = [];
        data.forEach((element) => {
          res_data.push({
            id: element.referance_awb,
            brand_name: element.brand_name,
            order_ref_number: element.brand_referance_number,
            status: element.client_status,
            client: element.customer_information,
            delivery_type: element.delivery_type,
            order_date: element.order_date,
            payment_type: element.payment_type,
          });
        });
        setFwbOrders(res_data);
      }

    function getNewToken(err, stored_user, callback_method) {
        const refersh_token = stored_user.refreshToken;
        if (err.response) {
          const err_res = err.response.data;
          if (err_res.detail !== undefined && err_res.detail.includes("expired")) {
            axios
              .post("https://authlive.logistiq.io/auth/api/v1/accounts/token", {
                refresh_token: refersh_token,
              })
              .then((response) => {
                stored_user.token = response.data.data.access_token;
                stored_user.refreshToken = response.data.data.refresh_token;
                store.set("user", stored_user);
                if (callback_method === "1") fetchFwbOrders();
                else invoke_PrintLabelAPI();
              })
              .catch((err) => {
                const err_res = err.response.data;
                if (err_res.detail.includes("expired")) {
                  store.set("isAuthenticated", false);
                  setIsAuthenticated(false);
                }
                setLinerLoader(false);
              });
          } else {
            console.log("err >>", err_res);
            setLinerLoader(false);
          }
        }
    }

    const invoke_PrintLabelsAPI = async (awbs) => {
        const stored_user = store.get("user");
        const error_awb = [];
        const success_awb = [];
        if (stored_user) {
          const token = stored_user.token;
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };
          awbs.forEach(async (awb) => {
            await axios
              .get(
                "https://hawklive.logistiq.io/allocation/api/v1/tracking/print-cp-label?awb=" +
                  awb,
                {
                  headers: headers,
                }
              )
              .then((response) => {
                if (response.data.status) {
                    success_awb, error_awb = download_File1(response.data.label, awb, success_awb, error_awb);
                  console.log(is_downloaded);
                } else {
                  error_awb.push(awb);
                }
              })
              .catch((err) => {
                getNewToken(err, stored_user, "2");
              });
            if (error_awb.length > 0) {
              setErrorMsg(`Unable to download the lables following awbs:${error_awb.slice()}`);
              setErrorBanner(true);
            }
            if(success_awb.length > 0) {
                setSuccessMsg(`Labels downloaded successfully`);
                setSuccessBanner(true);
            }
          });
          setCircularLoading(false);
        }else {
            setCircularLoading(false);
        }
      };

   

    const download_File1 = (url, awb, success_awb, error_awb) => {
        const fileName = url.substring(url.lastIndexOf("/") + 1);

        axios.get(url, { responseType: "blob"})
          .then((res) => {
            fileDownload(res.data, `${awb}_${fileName}`);
            success_awb.push(awb);
          })
          .catch((err) => {
            console.log(err);
            error_awb.push(awb);
          });

          return success_awb, error_awb
        
    };

    const invoke_PrintLabelAPI = async (awb) => {
        const stored_user = store.get("user");
        if (stored_user) {
          const token = stored_user.token;
          const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };
          const response = await axios
            .get(
              "https://hawklive.logistiq.io/allocation/api/v1/tracking/print-cp-label?awb=" +
                awb,
              {
                headers: headers,
              }
            )
            .catch((err) => {
              getNewToken(err, stored_user, "2");
            });
          if (response) {
            console.log(response.data);
            if (response.data.status) {
              download_File(response.data.label, awb);
            }else {
                if(response.data.status === false) {
                    setErrorMsg(`${awb} ${response.data.message}`)
                    setErrorBanner(true);
                } else {
                    setErrorMsg(`${awb} Unable to get the response from the server. Please try after sometimes..`)
                    setErrorBanner(true);
                }
            }
          }
        }
    };

    function buildReturnPayload(awb) {
        return {
          alpha_awb: `${awb}`,
          delivery_type: "RETURN",
          is_partial: false,
        };
    }

    const invokeBookReturnOrderAPI = async (awb) => {
        const book_order_request_data = buildReturnPayload(awb);
        const stored_user = store.get("user");
        if (stored_user) {
          const token = stored_user.token;
          const refersh_token = stored_user.refreshToken;
          const header = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          };
    
          const response = await axios
            .post(
              "https://authlive.logistiq.io/auth/api/v1/orders/order-create",
              book_order_request_data,
              { headers: header }
            )
            .catch((err) => {
              if (err.response) {
                const err_res = err.response.data;
                if (err_res.detail.includes("expired")) {
                  axios
                    .post("https://authlive.logistiq.io/auth/api/v1/accounts/token", {
                      refresh_token: refersh_token,
                    })
                    .then((response) => {
                      stored_user.token = response.data.data.access_token;
                      stored_user.refreshToken = response.data.data.refresh_token;
                      store.set("user", stored_user);
                      invokeBookReturnOrderAPI(awb);
                    })
                    .catch((err) => {
                      const err_res = err.response.data;
                      if (err_res.detail.includes("expired")) {
                        setErrorMsg('Unauthenticated. Please login agin...')
                        setErrorBanner(true);
                        store.set("isAuthenticated", false);
                        setIsAuthenticated(false);
                      }
                    });
                } else {
                  console.log('Else part')
                }
              }
            });
          if (response) {
            console.log("Auth Response ", response.data);
            const authResponse = response.data;
            const authData = response.data.data[0];
            if (authResponse.status && authData.status) {
              console.log("Order Booked");
              setSuccessMsg(`${awb} Order Returned Successfully`);
              setSuccessBanner(true);
            } else {
              console.log("unable to book this order with Alpha");
              setErrorMsg(`Unable to book ${awb} order with Logistiq. Please try again...`)
              setErrorBanner(true);
            }
          } 
        } else {
            setErrorMsg('Unauthenticated. Please login agin...')
            setErrorBanner(true);
            store.set("isAuthenticated", false);
            setIsAuthenticated(false);
        }
    };

    const download_File = (url, awb) => {
        const fileName = url.substring(url.lastIndexOf("/") + 1);

        axios.get(url, { responseType: "blob"})
          .then((res) => {
            fileDownload(res.data, `${awb}_${fileName}`);
            setSuccessMsg(`${awb} label downloaded successfully`);
            setSuccessBanner(true);
          })
          .catch((err) => {
            console.log(err);
            setErrorMsg(`Unable to download the label ${awb}`)
            setErrorBanner(true);
          });
      };

    const handleTrack = useCallback(
        (params) => () => {
            const tracking_url = `https://gecko.logistiq.io/#/order/tracking?awb=${params.id}`;
            console.log(tracking_url);
            window.open(`${tracking_url}`, "_blank");
      },
      [],
    );

    const handlePrint = useCallback(
        (params) => () => {
          console.log(params)
          invoke_PrintLabelAPI(params.id);
        },
        [],
      );

    const handleReturn = useCallback(
        (params) => () => {
            //invokeBookReturnOrderAPI(params.id);
            console.log(params);
        },
        [],
    );

    const handleSelectedPrintLabels = () => {
        const selectedData = selectionModel;
        if(selectedData.length > 0) {
            setCircularLoading(true);
            invoke_PrintLabelsAPI(selectedData);
        }
    }

    function status_Massking(params) {
        switch (params) {
          case "BOOKED":
            return "#FFB545"
          case "INTRANSIT":
            return "#2E65F3"
          case "PICKED_UP":
            return "#F59300";
          case "CANCELLED":
            return "yellow";
          case "DELIVERED":
            return "#249F5D"
          case "RETURNED":
            return "#F32D2D";
          default:
            return "#FFB545";
        }
    }
    

    function getCustomerInfo(params) {
        return (
            <Grid container justifyContent={'center'} alignItems={'center'}>
                 <Grid item xs={12}>
                    <Typography variant="button" display="block"  gutterBottom>{params.row.client.customer_name}</Typography>
                    <Typography variant="caption" display="block"  gutterBottom>
                        {params.row.client.address.address}  {params.row.client.address.city}, {params.row.client.address.state}, {params.row.client.address.postal_code}
                    </Typography>
                    <Typography variant="caption" display="block"  gutterBottom>
                        {params.row.client.calling_code} {params.row.client.phone} 
                    </Typography>
                </Grid>
            </Grid>
        );
      }

    function formatOrderID(params) {
        return (
            <Grid container justifyContent={'center'} alignItems={'center'}>
                <Grid item xs={12}>
                    <Typography variant="button" display="block" gutterBottom>{params.row.order_ref_number} </Typography>
                    <Typography variant="overline" display="block" gutterBottom>AWB: {params.id} </Typography>
                </Grid>
            </Grid>

        );
    }
    

    const rows = fwbOrders;

    const column = useMemo(() => [
        { field: 'id', headerName: 'Order ID', flex: 0.5, renderCell: (params) => formatOrderID(params)},
        { field: 'status', headerName: 'Status', width: 200, renderCell: (params)=>(<Typography variant="button" color={status_Massking(params.row.status)}  gutterBottom>{params.row.status}</Typography>)},
        { field: 'customer', headerName: 'Customer Info', flex: 0.5, renderCell: (params) => getCustomerInfo(params)},
        { field: 'delivery_type', headerName: 'Delivery Type', width: 150, renderCell: (params)=>(<Typography variant="overline"   gutterBottom>{params.row.delivery_type}</Typography>)},
        { field: 'payment_type', headerName: 'Payment Type', width: 150, renderCell: (params)=>(<Typography variant="overline"   gutterBottom>{params.row.payment_type}</Typography>)},
        { field: 'order_date', headerName: 'Order Date', width: 200, renderCell: (params)=>(<Typography variant="overline"  gutterBottom>{moment(params.row.order_date).format("MMM D YYYY")}</Typography>)},
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150,
            getActions: (params) => [
              <GridActionsCellItem icon={<PrintIcon />} label="Print" color='success' onClick={handlePrint(params)}/>,
              <GridActionsCellItem icon={<PlaceIcon />} label="Track" size='large' onClick={handleTrack(params)}/>,
              <GridActionsCellItem disabled={params.row.status==='RETURNED'} icon={<AssignmentReturnIcon />} label="Return" size='large' color='error' onClick={handleReturn(params)}/>,
            ],
          },
    ], [handleTrack, handlePrint, handleReturn]);

    const snakeBarContent = (
        <Snackbar open={snakeState.open}
            onClose={handleSnakeBarClose}
            TransitionComponent={snakeState.Transition}
            message="Label downloaded successfully"
        >

        </Snackbar>

    );

    const alertFeedBackContent = (
        <Collapse in={successBanner}>
            <Alert variant="filled" severity="success" onClose={()=>setSuccessBanner(false)}>
                <AlertTitle>Success</AlertTitle>
                {successMsg}
            </Alert>
        </Collapse>
    );

    const alertFeedBackErrorContent = (
        <Collapse in={errorBanner}>
            <Alert variant="filled" severity="error" onClose={()=>setErrorBanner(false)}>
                <AlertTitle>Error</AlertTitle>
                {errorMsg}
            </Alert>
        </Collapse>
    );

    const headerContent = (
        <Grid container direction="row" justifyContent={'flex-end'} alignItems={'center'}>
            <Grid item xs={2}>
                <LoadingButton  variant={'contained'} loading={circularLoading} loadingPosition={'center'}
                startIcon={<PrintIcon/>} onClick={handleSelectedPrintLabels}
                >Print Selected Lables</LoadingButton>
            </Grid>
        </Grid>
    );

  return (
   <Box sx={{width: '100%'}}>
    <Grid container spacing={2}>
        <Grid item xs={12}>
            {alertFeedBackContent}
            {alertFeedBackErrorContent}
        </Grid>
        <Grid item xs={12}>
            {headerContent}
        </Grid>
        <Grid item xs={12}>
            <DataGrid autoHeight rows={rows} columns={column}  getRowHeight={() => 'auto'}
                initialState={{ pinnedColumns: { left: ['id'], right: ['actions'] } }}
                components={{LoadingOverlay: LinearProgress}}
                loading={linerLoader}
                checkboxSelection
                onSelectionModelChange={(newSelectionModel) => {setSelectionModel(newSelectionModel)}}
                selectionModel={selectionModel}
                apiRef={apiRef}
                >
            </DataGrid>
        </Grid>
    </Grid>
   
   </Box>
  )
}

export default FWD_OrderPage