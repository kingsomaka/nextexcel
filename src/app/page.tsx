"use client";

// import {OutTable, ExcelRenderer} from 'react-excel-renderer';
const ExcelJS = require('exceljs');
import * as XLSX from 'xlsx';
import Image from 'next/image';
import { useState, useRef } from 'react';

interface Foo {
  items: any[];
}

export default function Home() {
  const [state, setState] = useState<Foo>({ items: [] });
  const [headRow, setHeadRow] = useState<string[]>([]);
  const [dataRow, setDataRow] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // const renderFile = (fileObj: any) => {
  //   //just pass the fileObj as parameter
  //   ExcelRenderer(fileObj, (err, resp) => {
  //     if (err) {
  //       console.log(err);
  //     }
  //     else {
  //       this.setState({
  //         dataLoaded: true,
  //         cols: resp.cols,
  //         rows: resp.rows
  //       });
  //     }
  //   });
  // }

  const renderFile = (fileObject: any) => {
    // const renderFile = () => {


    // const files = document.querySelector<HTMLInputElement>('#file1').files;
    // const fileObject = files[0]; 
    if (typeof fileObject === "undefined") {
      console.error("none, fileObject");
      return;
    }
    //console.log(fileObject);
    const blobURL = window.URL.createObjectURL(fileObject);
    console.log(blobURL);
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      const result = xhr.response; // ArrayBuffer
      //      console.log(result);
      const data = new Uint8Array(result);
      //      console.log(data);
      loadExcelData(data);
    };
    xhr.responseType = "arraybuffer";
    xhr.open("GET", blobURL);
    xhr.send();
    console.log("start-upload");
  }

  // async loadExcelData(data: any){
  const loadExcelData = async (data: any) => {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(data);
      const worksheet = workbook.getWorksheet('sheet1');
      // worksheet.pageSetup = { orientation: 'portrait' };
      const startRow = 4;
      const items: any[] = [];
      let row = worksheet.getRow(1);
      for (let i = startRow; i < 11; i++) {
        row = worksheet.getRow(i);
        if (row.getCell(1).value !== null) {
          console.log(row.getCell(1).value);
          let item = {
            ID: row.getCell(1).value,
            NAME: row.getCell(2).value,
            VALUE: row.getCell(3).value,
          }
          items.push(item);
        }
      }
      //    console.log(items);
      setState({ items: items });
      console.log(JSON.stringify(state.items));
      alert("complete load data");
    } catch (e) {
      console.error(e);
      alert("Error, load data");
    }
  }

  const _handleFile = async (e: any) => {
    console.log('reading input file:');
    // const file = e.target.files[0];
    // const data = await file.arrayBuffer();
    const data = await e.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData: any = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
    });

    const headers: any = jsonData[0];
    const heads = headers.map((head: any) => ({ title: head, field: head }));
    jsonData.splice(0, 1);


    setHeadRow(headers);
    setDataRow(jsonData);
    convertToJson(headers, jsonData);

    //console.log(e.target.files[0]);
    //console.log(workbook);
    console.log(jsonData);
  }

  const convertToJson = async (headers: any, data: any) => {
    const rows: any = [];
    data.forEach(async (row: any) => {
      let rowData: any = {};
      row.forEach(async (element: any, index: any) => {
        rowData[headers[index]] = element;
      })
      console.log('rowData--->', rowData);
      rows.push(rowData);
    });
    return rows;

  }

  const fileHandler = (event: any) => {
    if (event.target.files.length) {
      let fileObj = event.target.files[0];
      let fileName = fileObj.name;


      //check for file extension and pass only if it is .xlsx and display error message otherwise
      if (fileName.slice(fileName.lastIndexOf('.') + 1) === "xlsx") {
        // setState({
        //   uploadedFileName: fileName,
        //   isFormInvalid: false
        // });
        // renderFile(fileObj)
        // renderFile();
        _handleFile(fileObj);
      }
      else {
        // setState({
        //   isFormInvalid: true,
        //   uploadedFileName: ""
        // })
      }
    }
  }

  const openFileBrowser = () => {
    fileInputRef.current!.click();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 w-screen bg-slate-500">
      <div className="z-10 w-fit flex flex-col items-center justify-between font-mono text-sm lg:flex bg-slate-500">
        

        {/* <button color="info" style={{color: "white", zIndex: 0}} onClick={this.openFileBrowser.bind(this)}><i className="cui-file"></i> Browse&hellip;</button> */}
        <button className=' bg-violet-600 py-2 px-4' style={{ color: "black", zIndex: 0 }} onClick={openFileBrowser}>Browse&hellip;</button>
        {/* <input type="file" hidden onChange={this.fileHandler.bind(this)} ref={fileInputRef} onClick={(event)=> { event.target.value = null }} style={{"padding":"10px"}} /> */}
        <input type="file" name="file1" id="file1" hidden ref={fileInputRef} onChange={(event) => { fileHandler(event); }} onClick={(event) => { event.currentTarget.value = '' }} style={{ "padding": "10px" }} />

        {/* const [headRow, setHeadRow] = useState<string[]>([]);
  const [dataRow */}

        {/* <h3>XXX経費資料</h3> */}
        {/* <div className="overflow-x-auto"> */}
        <table className="table table-zebra">
          <thead>
            <tr>
              {headRow.map((item: any, index: number) => (
                <th key={index}>{item}</th>
              ))}
            </tr>            
          </thead>
          <tbody>
            {dataRow && dataRow.map((item: any, index: number) => (
            <tr key={index}>
              {item.map((rowitem: any, rowindex: number) => (
                <td key={rowindex}>{rowitem}</td>
            ))}
            </tr>
            ))}
          </tbody>
        </table>
        {/* </div> */}
        

        
      </div>
    </main>
  )
}
