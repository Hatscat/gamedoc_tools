/* return a complete data array with all Y coords */
function extractDataFromHeightMap (url, maxHeight, callback)
{
	var img = new Image();

	img.onload = function ()
	{
		// Getting height map data
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		var heightMapWidth = img.width;
		var heightMapHeight = img.height;
		canvas.width = heightMapWidth;
		canvas.height = heightMapHeight;

		context.drawImage(img, 0, 0);

		var buffer = context.getImageData(0, 0, heightMapWidth, heightMapHeight).data;
		var data = [];

		// Extract data from canvas buffer
		for (var i = 0, c = buffer.length; i < c; i += heightMapWidth * 4)
		{
			data.push([]);

			for (var j = i, d = i + heightMapWidth * 4; j < d; j += 4)
			{
				var r = buffer[j] / 255.0;
				var g = buffer[j + 1] / 255.0;
				var b = buffer[j + 2] / 255.0;

				var gradient = r * 0.3 + g * 0.59 + b * 0.11;

				data[i / (heightMapWidth * 4)].push(gradient * maxHeight);
			}
		}
		callback(data);
	}
	img.src = url;
}

// create a ground mesh from heightmap data
function createGroundFromData (name, data, width, height, subdivisions, scene, updatable)
{
	var ground = new BABYLON.Mesh(name, scene);
	var indices = [];
	var positions = [];
	var normals = [];
	var uvs = [];
	var row, col;

	// Vertices
	for (row = 0; row <= subdivisions; row++)
	{
		for (col = 0; col <= subdivisions; col++)
		{
			var position = new BABYLON.Vector3((col * width) / subdivisions - (width / 2.0), 0, ((subdivisions - row) * height) / subdivisions - (height / 2.0));

			// Compute height
			position.y = getPosY(position.x, position.z, data, width, height);

			// Add  vertex
			positions.push(position.x, position.y, position.z);
			normals.push(0, 0, 0);
			uvs.push(col / subdivisions, 1.0 - row / subdivisions);
		}
	}

	// Indices
	for (row = 0; row < subdivisions; row++)
	{
		for (col = 0; col < subdivisions; col++)
		{
			indices.push(col + 1 + (row + 1) * (subdivisions + 1));
			indices.push(col + 1 + row * (subdivisions + 1));
			indices.push(col + row * (subdivisions + 1));

			indices.push(col + (row + 1) * (subdivisions + 1));
			indices.push(col + 1 + (row + 1) * (subdivisions + 1));
			indices.push(col + row * (subdivisions + 1));
		}
	}

	// Normals
	BABYLON.Mesh.ComputeNormal(positions, normals, indices);

	// Transfer
	ground.setVerticesData(positions, BABYLON.VertexBuffer.PositionKind, updatable);
	ground.setVerticesData(normals, BABYLON.VertexBuffer.NormalKind, updatable);
	ground.setVerticesData(uvs, BABYLON.VertexBuffer.UVKind, updatable);
	ground.setIndices(indices);

	return ground;
}

// return height (y coord) from x and z positions with the heightmap data array
function getPosY (x, z, data, width, height)
{
	var heightMapX = (((x + width / 2) / width) * (data.length - 1)) | 0;
	var heightMapY = ((1.0 - (z + height / 2) / height) * (data[0].length - 1)) | 0;

	return heightMapX < 0 || heightMapX >= data.length || heightMapY < 0 || heightMapY >= data[0].length ? 0 : data[heightMapX][heightMapY];
}
