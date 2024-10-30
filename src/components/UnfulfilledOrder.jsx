import  React, {useState, useCallback, useEffect, useMemo} from 'react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import store from "store-js";
import { Alert, AlertTitle, Box, Button, Collapse, Grid, IconButton, LinearProgress, TextField, Typography, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {DataGrid, GridActionsCellItem, useGridApiRef} from '@mui/x-data-grid';
import LoadingButton from '@mui/lab/LoadingButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from "axios";
import moment from 'moment/moment.js';
import { LOGISTIQ_CONSTANTS } from './Constants';
import LaunchIcon from '@mui/icons-material/Launch';
// import RenderedBoxDataModal from './BoxModal';


export default function UnfulfilledOrder({setIsAuthenticated}) {
  const [rows, setRows] = useState([]);
  const [linerLoader, setLinerLoader] = useState(true);
  const [circularLoading, setCircularLoading] = useState(false);
  const [selectionModel, setSelectionModel] = useState([]);
  const [enabledAutoRefresh, setEnabledAutoRefresh] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  // const[time, setTime] = useState(Date.now())
  const [rowBoxCounts, setRowBoxCounts] = useState({});
  const [successFeed, setSuccessFeed] = useState(false);
  const [errorFeed, setErrorFeed] = useState(false);
  const [sMsg, setSMsg] = useState('');
  const [eMsg, setEMsg] = useState('');
  const [boxModalState, setBoxModalState] = useState({
    open: false,
    rowId: null,
  });
  const [boxModalOpen, setBoxModalOpen] = useState(false);
  const [rowBoxDetails, setRowBoxDetaisl] = useState({})

  const initialBoxData = {
    length: '',
    breadth: '',
    height: '',
    weight: '',
    items: [
      { sku: '', skuDescription: '', skuQuantity: '' }
    ]
  };

  useEffect(() => {
    const timer = setTimeout(()=> {
      setSuccessFeed(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [successFeed]);

useEffect(() => {
    const timer = setTimeout(()=> {
      setErrorFeed(false);
    }, 15000);
    return () => clearTimeout(timer);
  }, [errorFeed]);

useEffect(() => {
  setSMsg(sMsg);
  }, [sMsg]);

useEffect(() => {
  setEMsg(eMsg);
}, [eMsg]);

useEffect(() => {
  const interval = setInterval(() => {
    setLinerLoader(true);
    fetchOrders()
  }, 900000); //Every 15 min fetch the orders
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  setLinerLoader(true);
  fetchOrders(); // Fetch orders when page or page size changes
}, [page, pageSize]);



  const fetchOrders = async () => {
    const webhookconfig = store.get('user').webhook.webhookConfig
    const KEY = webhookconfig.key
    const SECRET = webhookconfig.secret
    const ORDER_STATUS = 'processing';
    const sort_by = 'asc';
    const response = await fetch(`/wp-json/wc/v3/orders?consumer_key=${KEY}&consumer_secret=${SECRET}&status=${ORDER_STATUS}&page=${page + 1}&per_page=${pageSize}&order=${sort_by}`);
    if(!response.ok) {
        console.log('Something went wrong');
        setLinerLoader(false);
    }
    const data = await response.json();
    if(data){
        build_mapping(data);
    } else {
      setLinerLoader(false);
    }
  }

  function orderData(id, status, created_at, currency, line_items, order_key, payment_method, payment_method_title, shipping, billing, total) {
    let skuDetails =[];
    line_items.forEach((line_item)=>{
      skuDetails.push({
        sku:line_item.sku,
        skuDescription: line_item.name,
        skuQuantity: line_item.quantity
      })
    })
  let boxDetails = {...initialBoxData};
  boxDetails = {
    length: '1',
    breadth: '1',
    height: '1',
    weight: '1',
    items: skuDetails
  }
  let shipmentDetails = []
  shipmentDetails.push(boxDetails)
    return {
      id,
      status,
      created_at,
      currency,
      line_items,
      order_key,
      payment_method,
      payment_method_title,
      shipping,
      billing,
      total,
      boxCount:1,
      shipmentDetails 
    };
  }

  function build_mapping(data){
      const res_data = [];
      data.forEach((e) => {
          res_data.push(orderData(e.id, e.status, e.date_created, e.currency, e.line_items, e.order_key, e.payment_method,
              e.payment_method_title, e.shipping, e.billing, e.total));
      });
      console.log(res_data);
      if(res_data.length > 0) {
          setRows(res_data);
          console.log(rows)
      }
      setLinerLoader(false);
  }

  useEffect(() => {
      fetchOrders();
  }, []);

  // useEffect(() => {
  //   if(rows.length > 0) {
  //     setRows(rows);
  //     console.log("Orders ", rows);
  //   }
  // }, [rows]);

  useEffect(() => {
    setLinerLoader(linerLoader);
  }, [linerLoader]);

  useEffect(() => {
  setCircularLoading(circularLoading);
  }, [circularLoading]);

  useEffect(() => {
    setEnabledAutoRefresh(enabledAutoRefresh);
  }, [enabledAutoRefresh])
  

const bookwithLQ = () => {
    // let selected_data = rows.find((x) => {
    //     if (x.id == selectionModel[0]) {
    //       return x;
    //     }
    //   });
    //   if(selected_data) {
    //     invokeBookOrderAPI(selected_data);
    //   }
    if (selectionModel.length > 0){
      selectionModel.forEach(async (x) => {
        let selected_data = rows.find((y) => {
          if (y.id == x) {
            return y
          }
        });
        if (selected_data) {
          invokeBookOrderAPI(selected_data);
        }
      }
      )
    }
}

const invokeBookOrderAPI = async (data) => {
      const book_order_request_data = map_bookOrder(data);
      console.log("book order ", book_order_request_data);
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
            `${LOGISTIQ_CONSTANTS.AUTH_API_BASE_URL}/${LOGISTIQ_CONSTANTS.BOOK_ORDER_URL}`,
            book_order_request_data,
            { headers: header }
          )
          .catch((err) => {
            if (err.response) {
              const err_res = err.response.data;
              if (err_res.detail.includes("expired")) {
                axios
                  .post(`${LOGISTIQ_CONSTANTS.AUTH_API_BASE_URL}/${LOGISTIQ_CONSTANTS.REFRESH_TOKEN_URL}`, {
                    refresh_token: refersh_token,
                  })
                  .then((response) => {
                    stored_user.token = response.data.data.access_token;
                    stored_user.refreshToken = response.data.data.refresh_token;
                    store.set("user", stored_user);
                    invokeBookOrderAPI(data);
                  })
                  .catch((err) => {
                    const err_res = err.response.data;
                    if (err_res.detail.includes("expired")) {
                      store.set("isAuthenticated", false);
                      setIsAuthenticated(false);
                    }
                  });
              } else {
                setEMsg(`${err_res.message}`);
                setErrorFeed(true);
              }
            }
          });
        if (response) {
          console.log("Auth Response ", response.data);
          const authResponse = response.data;
          const authData = response.data.data[0];
          if (authResponse.status && authData.status) {
            setSMsg(`${data.id} Order Booked Successfully with Logistiq`);
            setSuccessFeed(true);
            fullFill(data, authData);
            // // Redirect to Gecko
            // const orderlist_url = `${LOGISTIQ_CONSTANTS.GECKO_URL}`;
            // window.open(`${orderlist_url}`, "_blank");

          } else {
            console.log("unable to book this order with Alpha");
            const errorMessage = authResponse ? `Error: ${authResponse.message}` : JSON.stringify(authResponse);
            setEMsg(errorMessage);
            setErrorFeed(true);
          }
        } //else {
        //   setEMsg(`${data.id} Something went wrong while booking order with Logistiq`);
        //   setErrorFeed(true);
        // }
      } else {
        store.set("isAuthenticated", false);
        setEMsg('Unauthenticated. Please login agin...');
        setErrorFeed(true);
      }
    };

    const fullFill = async (data, auth_response) => {
      const webhookconfig = store.get('user').webhook.webhookConfig
      const KEY = webhookconfig.key
      const SECRET = webhookconfig.secret
      const REQUEST_OPTION = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({status: "completed"})
      }
      const response = await fetch(`/wp-json/wc/v3/orders/${data.id}?consumer_key=${KEY}&consumer_secret=${SECRET}`, REQUEST_OPTION);
      if(!response.ok) {
          console.log('Something went wrong when update the order status');
          setEMsg('Something went wrong when update the order status in Woocommerce store')
          setErrorFeed(true);
        }
      const fulfillResData = await response.json();
      console.log('Fulfillresponse', fulfillResData);
      setSMsg('Successfully update the order status in Woocommerce store');
      setSuccessFeed(true);
      fetchOrders();
    }

  function map_bookOrder(data) {
    const { id, line_items, shipping, billing, needs_payment, payment_method, order_key, total, currency, boxCount} = data;
    const boxDetails = [];
    let shipmentDetails = [];
    const { address_1, address_2, city, postcode, state, phone, country } = shipping.phone.length > 1 ? shipping : billing;
    const addressFields = [address_1, address_2, city, state, postcode].filter(value => value !== null && value !== '');
    const customerAddress = addressFields.join(', ');
    const customerName =  shipping.first_name.length > 0 ? shipping.first_name + " " + data.shipping.last_name : billing.first_name + " " + billing.last_name
    const order_type = payment_method=='cod' ? "COD" : "PREPAID";
    line_items.forEach((item) => {
      const { id, name, quantity, total, sku, image, price } = item;
      boxDetails.push({
        skuDescription: name != null ? name : 'NA',
        quantity: quantity,
        price: parseFloat(price),
        sku: sku != null ? sku : 'NA',
        image: image && image.src ? image.src : 'NA',
        item_bar_code: '' // Assuming item_bar_code is always empty
      });
    });
    for (let count=1; boxCount >= count; count++){
      shipmentDetails.push({
        id: count.toString(),
        weight: 1,
        length: 1, // Assuming fixed length
        breadth: 1, // Assuming fixed breadth
        height: 1, // Assuming fixed height
        items: boxDetails
      });
    }
    return {
      order_ref_number: id,
      invoice_number: order_key,
      payment_method: payment_method,
      invoice_currency_code: currency,
      cod_currency_code: currency,
      delivery_type: 'FORWARD',
      order_type: order_type,
      invoice_date: moment().format("L"),
      invoice_value: total,
      cod_value: order_type === 'PREPAID' ? 0 : total,
      sku: '',
      sku_description: '',
      qty: 0,
      vendor_code: order_key,
      customer_email: billing != null ? billing.email : '',
      customer_name: customerName,
      customer_address: customerAddress,
      customer_city: city,
      customer_postal_code: '',
      customer_state: '',
      customer_phone: phone.length > 1 ? phone : billing.phone,
      customer_country_code: country,
      is_mps: boxCount > 1 ? true : false,
      box_count: shipmentDetails.length,
      shipment_details: shipmentDetails
    }
  }

  const handleBookOrder = useCallback(
    (params) => () => {
    invokeBookOrderAPI(params.row);
  },
  [],
);

function getEmail(params) {
  return (
      <Grid container justifyContent={'center'} alignItems={'center'}>
          <Grid item xs={12}>
              <Typography variant="overline" display="block" gutterBottom>{params.row.billing.email}</Typography>
          </Grid>
      </Grid>

  );
}

function getBilling(params) {
  return (
      <Grid container justifyContent={'center'} alignItems={'center'}>
          <Grid item xs={12}>
              <Typography variant="button" display="block" gutterBottom>{params.row.billing.first_name || ''} {params.row.billing.last_name || ''}</Typography>
              <Typography variant="caption"  gutterBottom>
                        {params.row.billing.address_1},  {params.row.billing.address_2 || ''}
              </Typography>
              <Typography variant="caption" gutterBottom>
                        {params.row.billing.city},  {params.row.billing.state || ''}, {params.row.billing.postcode || ''}, {params.row.billing.country || ''}. {params.row.billing.phone || ''}
              </Typography>
          </Grid>
      </Grid>

  );
}

function getShipping(params) {
  return (
      <Grid container justifyContent={'center'} alignItems={'center'}>
          <Grid item xs={12}>
              <Typography variant="button" display="block" gutterBottom>{params.row.shipping.first_name || ''} {params.row.shipping.last_name || ''}</Typography>
              <Typography variant="caption"  gutterBottom>
                        {params.row.shipping.address_1},  {params.row.shipping.address_2 || ''}
              </Typography>
              <Typography variant="caption" gutterBottom>
                        {params.row.shipping.city},  {params.row.shipping.state || ''}, {params.row.shipping.postcode || ''}, {params.row.shipping.country || ''}. {params.row.shipping.phone || ''}
              </Typography>
          </Grid>
      </Grid>

  );
}

function getTotalFormat(params) {
  return (
      <Grid container justifyContent={'center'} alignItems={'center'}>
          <Grid item xs={12}>
              <Typography variant="overline"  gutterBottom>{params.row.currency}</Typography>
              <Typography variant="overline" gutterBottom> {params.row.total}</Typography>
          </Grid>
      </Grid>

  );
}

const handleRefreshButton = () => {
  setLinerLoader(true);
  fetchOrders()
}

const handleSelectAll = () => {
  let allRowIds = [];
selectionModel.length == rows.length ?  true :  allRowIds = rows.map(row => row.id);
  setSelectionModel(allRowIds);
};

const handle_redirect_gecko = () => {
  // Redirect to Gecko
  const orderlist_url = `${LOGISTIQ_CONSTANTS.GECKO_URL}`;
  window.open(`${orderlist_url}`, "_blank");
}

const handleBoxDataButtonClick = (rowId) => {
  setBoxModalState({ open: true, rowId:rowId });
  setBoxModalOpen(true);
};

 console.log("ROWWS===>" , rows)
  const column = useMemo(() => [
    { field: 'id', headerName: 'Order ID', flex: 0.2, renderCell: (params)=>(<Typography variant="button"   gutterBottom>{params.row.id}</Typography>)},
    { field: 'email', headerName: 'Customer Email', width: 255, renderCell: (params) => getEmail(params)},
    { field: 'created_at', headerName: 'Order Date', width: 150, renderCell: (params)=>(<Typography variant="overline"  gutterBottom>{moment(params.row.created_at).format("MMM D YYYY")}</Typography>)},
    { field: 'billing', headerName: 'Billing', flex: 0.5, renderCell: (params) => getBilling(params)},
    { field: 'shipping', headerName: 'Ship to', flex: 0.5, renderCell: (params) => getShipping(params)},
    { field: 'status', headerName: 'Status', width: 150, renderCell: (params)=>(<Typography variant="overline" display="block">{params.row.status}</Typography>)},
    { field: 'total', headerName: 'Total', width: 100, renderCell: (params) => getTotalFormat(params)},
    {
      field: 'boxCount',
      headerName: 'Box Count',
      width: 100,
      renderCell: (params) => (
        <Select
          value={params.row.boxCount || 1}
          onChange={(event) => {
            const newRows = rows.map((row) => {
              if (row.id === params.row.id) {
                return { ...row, boxCount: event.target.value };
              }
              return row;
            });
            setRows(newRows);
          }}
        >
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={5}>5</MenuItem>
        </Select>
      ),
    },
    {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 150,
        getActions: (params) => [
          <GridActionsCellItem icon={<LocalShippingIcon />} label="Book With Logistiq" color='success'onClick={handleBookOrder(params)}/>,
        ],
      },
], [handleBookOrder,rows ,handleBoxDataButtonClick]);

  const headerContent = (
    <Grid container direction="row" justifyContent={'flex-end'}>
        <Grid item xs={.5}>
          <IconButton color='primary' onClick={handleRefreshButton}><RefreshIcon/></IconButton>
        </Grid>
        <Grid item xs={2.15}>
        <Button variant="outlined" startIcon={<LaunchIcon/>} onClick={handle_redirect_gecko}>Go to Logistiq Client Panel</Button>
      </Grid>
        <Grid item xs={3} style={{marginLeft: '20px !important'}}>
            <LoadingButton variant={'contained'} loading={circularLoading} loadingPosition={'center'} onClick={bookwithLQ}
            startIcon={<LocalShippingIcon/>} 
            >Book Selected Order With Logistiq</LoadingButton>
        </Grid>
    </Grid>
  );

  const alertSuccessContent = (
      <Collapse in={successFeed}>
        <Alert variant="filled" severity="success" onClose={()=>setSuccessFeed(false)}>
          <AlertTitle>Success</AlertTitle>
          {sMsg}
        </Alert>
      </Collapse>
  );

  const alertErrorContent = (
    <Collapse in={errorFeed}>
      <Alert variant="filled" severity="error" onClose={()=>setErrorFeed(false)}>
        <AlertTitle>Error</AlertTitle>
        {eMsg}
      </Alert>
    </Collapse>
  );

  const handlePageChange = (selectedPage) => {
    setPage(selectedPage);
  };

  return(
    <Box sx={{ bgcolor: 'background.paper', width: '100%' }}>
    <Grid container spacing={2}>
        <Grid item xs={12}>
            {alertSuccessContent}
            {alertErrorContent}
          </Grid>
        <Grid item xs={12}>
            {headerContent}
        </Grid>
        <Grid item xs={2}>
            <Button variant="contained" color="primary" onClick={handleSelectAll}>Select All</Button>
        </Grid>
        <Grid item xs={12}>
            <DataGrid autoHeight rows={rows} columns={column}  getRowHeight={() => 'auto'}
                initialState={{ pinnedColumns: { left: ['id'], right: ['actions'] } }}
                components={{LoadingOverlay: LinearProgress}}
                loading={linerLoader}
                onSelectionModelChange={(newSelectionModel) => {
                  setSelectionModel(newSelectionModel)
                }}
                selectionModel={selectionModel}
                checkboxSelection
                disableRowSelectionOnClick
                page={page}
                pageSize={pageSize}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                >
            </DataGrid>
        </Grid>
        <Grid item xs={12} style={{ textAlign: 'right' }}>
            <select value={page} onChange={(e) => handlePageChange(parseInt(e.target.value))}>
            {[...Array(30)].map((_, index) => (
              <option key={index} value={index}>{index + 1}</option>
            ))}
            </select>
        </Grid>
    </Grid>
    {/* {rows.length > 0 && boxModalOpen && <RenderedBoxDataModal boxModalOpen={boxModalOpen} boxModalState={boxModalState} rowsdata={rows} />} */}
    {/* {renderedBoxDataModal(boxModalOpen, boxModalState, rows )} */}
   </Box>
  );
}