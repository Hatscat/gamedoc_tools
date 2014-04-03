/* return a complete data array with all Y coords */
function extractDataFromHeightMap (url, maxHeight,id, callback)
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
		callback(data, id);
	}
	img.src = url;
}

// create a ground mesh from heightmap data
function createGroundFromData (name, data, width, height, subdivisions, scene, updatable)
{
	var ground = {};
	ground.data = [];
	ground.mesh = new BABYLON.Mesh(name, scene);
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
			position.y = getPosOnHeightMap(position.x, position.z, data, width, height).y;
			
			ground.data.push(position);
			
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
	ground.mesh.setVerticesData(positions, BABYLON.VertexBuffer.PositionKind, updatable);
	ground.mesh.setVerticesData(normals, BABYLON.VertexBuffer.NormalKind, updatable);
	ground.mesh.setVerticesData(uvs, BABYLON.VertexBuffer.UVKind, updatable);
	ground.mesh.setIndices(indices);

	return ground;
}

function normalize (distanceX, distanceZ)
{
	var normalisationRatio = Math.abs(distanceX) + Math.abs(distanceZ);
	normalisationRatio = normalisationRatio ? normalisationRatio : 1;
	return { x: distanceX / normalisationRatio, z: distanceZ / normalisationRatio };
}

// return coords from x and z positions with the heightmap data array
function getPosOnHeightMap (x, z, mapData, width, height)
{
	var pos = {};
	
	pos.x = (((x + width / 2) / width) * (mapData.length - 1)) | 0;
	pos.z = ((1.0 - (z + height / 2) / height) * (mapData[0].length - 1)) | 0;

	if (pos.x < 0 || pos.x >= mapData.length || pos.z < 0 || pos.z >= mapData[0].length)
		return 0;
	else
		pos.y = mapData[pos.x][pos.z];
	return pos;
}

function getYPosOnMesh (x, z, meshData, width, height, subdivisions) // --------------------------- NEW
{	
	var s = subdivisions + 1;
	// var p = { x: x, z: z }; // pour calculer les distances, si besoin
	var margin = 50 / subdivisions;
	var x_in_array = (x + 25) / margin;
	var z_in_array = (25 - z) / margin;
	var floor_x_in_array = x_in_array | 0; // + 0.5 si on doit chercher le + proche
	var floor_z_in_array = z_in_array | 0;
	var ratio_x = x_in_array - floor_x_in_array;
	var ratio_z = z_in_array - floor_z_in_array;
	var inv_ratio_x = 1 - ratio_x;
	var inv_ratio_z = 1 - ratio_z;
	var xz_pos_1 = floor_x_in_array + floor_z_in_array * s;
	var xz_pos_2 = xz_pos_1 + 1;

	var xz_point_top_left	= meshData[xz_pos_1]; // WARNING
	var xz_point_top_right	= meshData[xz_pos_2];
	var xz_point_bot_left	= meshData[xz_pos_1 + s];
	var xz_point_bot_right	= meshData[xz_pos_2 + s];

	var xz_value_top_left	= inv_ratio_x * inv_ratio_z * xz_point_top_left.y;
	var xz_value_top_right	= inv_ratio_x * ratio_z * xz_point_top_right.y;
	var xz_value_bot_left	= ratio_x * inv_ratio_z * xz_point_bot_left.y;
	var xz_value_bot_right	= ratio_x * ratio_z * xz_point_bot_right.y;
	
	return xz_value_top_left + xz_value_top_right + xz_value_bot_left + xz_value_bot_right;
}

function getYFromMesh (scene, player_pos, ground_mesh)
{
	var origin = new BABYLON.Vector3(player_pos.x, player_pos.y + 50, player_pos.z);
	var direction = new BABYLON.Vector3(player_pos.x, player_pos.y - 50, player_pos.z);
	var distance = direction.length();
	direction.normalize();
	var ray = new BABYLON.Ray(origin, direction);
	var pickInfo = scene.pickWithRay(ray, function(m){return m == ground_mesh}, 1);
	//console.log(pickInfo);
	return pickInfo.pickedPoint.y;
}

function marginRound (number, margin)  // -------------------------------------- NEW
{
	return (number / margin | 0) * margin;
}

function distanceCarre (a, b)
{
	var x = a.x - b.x;
	var z = a.z - b.z;
	return x * x + z * z;
}