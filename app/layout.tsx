import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"经营智能台｜电商分析与新品生产",description:"面向淘宝与抖音运营的数据分析、经营诊断和新品生产工作台。",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
